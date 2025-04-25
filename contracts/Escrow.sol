// SPDX-License-Identifier: MIT
// Smart contract by Byteory - Blockchain Development Agency
// https://byteory.com

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow is ReentrancyGuard, Ownable, Pausable {
    struct EscrowAgreement {
        address buyer;
        address seller;
        uint256 amount;
        uint256 createdAt;
        uint256 releaseTime;
        bool isReleased;
        bool isDisputed;
        uint256 projectId;
        uint256 milestoneCount;
        mapping(uint256 => Milestone) milestones;
        uint256 disputeCount;
        uint256 lastDisputeTime;
        address[] arbitrators;
        mapping(address => bool) isArbitrator;
        mapping(uint256 => ExtensionRequest) extensionRequests;
        uint256 extensionRequestCount;
        mapping(uint256 => RevisionRequest) revisionRequests;
        uint256 revisionRequestCount;
        bool isCancelled;
        uint256 cancellationRequestedAt;
        address cancellationRequestedBy;
        bool cancellationApproved;
        uint256 cancellationFee;
        uint256 completedWorkPercentage;
        mapping(uint256 => MilestoneProgress) milestoneProgress;
        uint256 qualityAssurancePeriod;
        uint256 qualityAssuranceEndTime;
        bool qualityAssurancePassed;
        address qualityAssuranceVerifier;
        uint256 insuranceAmount;
        bool insuranceClaimed;
        uint256 insuranceClaimTime;
        address insuranceClaimedBy;
    }

    struct Milestone {
        uint256 amount;
        uint256 dueDate;
        bool isCompleted;
        bool isPaid;
        uint256 completionTime;
        address completedBy;
    }

    struct ExtensionRequest {
        uint256 milestoneId;
        uint256 newDueDate;
        uint256 requestedAt;
        bool isApproved;
        bool isRejected;
        address requestedBy;
    }

    struct RevisionRequest {
        uint256 milestoneId;
        string description;
        uint256 requestedAt;
        bool isApproved;
        bool isRejected;
        address requestedBy;
        uint256 newAmount;
        uint256 newDueDate;
    }

    struct MilestoneProgress {
        uint256 progressPercentage;
        uint256 lastUpdatedAt;
        address updatedBy;
        string progressDescription;
        bool isVerified;
        uint256 verificationPeriod;
        uint256 verificationEndTime;
        bool verificationPassed;
    }

    struct InsurancePool {
        uint256 totalDeposits;
        uint256 totalClaims;
        uint256 maxCoveragePerEscrow;
        uint256 minDeposit;
        uint256 claimProcessingTime;
        mapping(address => uint256) userDeposits;
        mapping(address => uint256) userClaims;
    }

    struct ProjectEscrowParams {
        address seller;
        uint256 projectId;
        uint256 timeline;
        uint256[] milestoneAmounts;
        uint256[] milestoneDueDates;
        address[] arbitrators;
    }

    mapping(bytes32 => EscrowAgreement) public escrows;
    uint256 public feePercentage;
    uint256 public minEscrowAmount;
    uint256 public maxEscrowAmount;
    uint256 public maxDisputesPerEscrow;
    uint256 public disputeCooldownPeriod;
    uint256 public maxArbitratorsPerEscrow;
    mapping(address => bool) public isBlacklisted;
    mapping(address => uint256) public userDisputeCount;
    uint256 public constant MAX_FEE_PERCENTAGE = 1000; // 10%

    event ProjectEscrowCreated(
        bytes32 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 projectId,
        uint256 amount,
        uint256 milestoneCount
    );
    event MilestoneCompleted(bytes32 indexed escrowId, uint256 milestoneId, address completedBy);
    event MilestonePaid(bytes32 indexed escrowId, uint256 milestoneId, uint256 amount);
    event DisputeInitiated(bytes32 indexed escrowId, address indexed initiator);
    event DisputeResolved(bytes32 indexed escrowId, address indexed winner, uint256 amount);
    event ArbitratorAdded(bytes32 indexed escrowId, address indexed arbitrator);
    event ArbitratorRemoved(bytes32 indexed escrowId, address indexed arbitrator);
    event UserBlacklisted(address indexed user, bool blacklisted);
    event ExtensionRequested(
        bytes32 indexed escrowId,
        uint256 indexed milestoneId,
        uint256 newDueDate,
        address requestedBy
    );
    event ExtensionApproved(
        bytes32 indexed escrowId,
        uint256 indexed milestoneId,
        uint256 newDueDate
    );
    event ExtensionRejected(
        bytes32 indexed escrowId,
        uint256 indexed milestoneId
    );
    event RevisionRequested(
        bytes32 indexed escrowId,
        uint256 indexed milestoneId,
        string description,
        uint256 newAmount,
        uint256 newDueDate,
        address requestedBy
    );
    event RevisionApproved(
        bytes32 indexed escrowId,
        uint256 indexed milestoneId,
        uint256 newAmount,
        uint256 newDueDate
    );
    event RevisionRejected(
        bytes32 indexed escrowId,
        uint256 indexed milestoneId
    );
    event EscrowCancelled(
        bytes32 indexed escrowId,
        address indexed cancelledBy,
        uint256 amountReturned,
        uint256 cancellationFee
    );
    event CancellationRequested(
        bytes32 indexed escrowId,
        address indexed requestedBy,
        uint256 requestedAt
    );
    event CancellationApproved(
        bytes32 indexed escrowId,
        address indexed approvedBy
    );
    event MilestoneProgressUpdated(
        bytes32 indexed escrowId,
        uint256 indexed milestoneId,
        uint256 progressPercentage,
        string description,
        address updatedBy
    );
    event MilestoneProgressVerified(
        bytes32 indexed escrowId,
        uint256 indexed milestoneId,
        bool passed,
        address verifiedBy
    );
    event QualityAssuranceStarted(
        bytes32 indexed escrowId,
        uint256 period,
        uint256 endTime
    );
    event QualityAssurancePassed(
        bytes32 indexed escrowId,
        address verifiedBy
    );
    event QualityAssuranceFailed(
        bytes32 indexed escrowId,
        address verifiedBy
    );
    event InsuranceDeposited(
        address indexed depositor,
        uint256 amount,
        uint256 totalDeposits
    );
    event InsuranceClaimed(
        bytes32 indexed escrowId,
        address indexed claimant,
        uint256 amount,
        uint256 claimTime
    );
    event InsuranceClaimProcessed(
        bytes32 indexed escrowId,
        bool approved,
        address processedBy
    );

    InsurancePool public insurancePool;
    uint256 public insuranceFeePercentage = 100; // 1%

    constructor(
        uint256 _feePercentage,
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _maxDisputes,
        uint256 _disputeCooldown,
        uint256 _maxArbitrators
    ) Ownable() Pausable() {
        require(_feePercentage <= MAX_FEE_PERCENTAGE, "Fee too high");
        feePercentage = _feePercentage;
        minEscrowAmount = _minAmount;
        maxEscrowAmount = _maxAmount;
        maxDisputesPerEscrow = _maxDisputes;
        disputeCooldownPeriod = _disputeCooldown;
        maxArbitratorsPerEscrow = _maxArbitrators;

        // Initialize insurance pool
        insurancePool.maxCoveragePerEscrow = _maxAmount;
        insurancePool.minDeposit = _minAmount;
        insurancePool.claimProcessingTime = 7 days; // 7 days for claim processing
    }

    modifier notBlacklisted() {
        require(!isBlacklisted[msg.sender], "User is blacklisted");
        _;
    }

    modifier onlyArbitrator(bytes32 escrowId) {
        require(escrows[escrowId].isArbitrator[msg.sender], "Not an arbitrator");
        _;
    }

    modifier onlyParties(bytes32 escrowId) {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(msg.sender == agreement.buyer || msg.sender == agreement.seller, "Only buyer or seller");
        _;
    }

    function createProjectEscrow(ProjectEscrowParams calldata params)
        external
        payable
        notBlacklisted
        whenNotPaused
    {
        require(!isBlacklisted[params.seller], "Seller is blacklisted");
        require(msg.value >= minEscrowAmount, "Amount below minimum");
        require(msg.value <= maxEscrowAmount, "Amount above maximum");
        require(params.timeline > 0, "Invalid timeline");
        require(params.milestoneAmounts.length == params.milestoneDueDates.length, "Invalid milestone dates");
        require(params.arbitrators.length <= maxArbitratorsPerEscrow, "Too many arbitrators");

        bytes32 escrowId = keccak256(
            abi.encodePacked(
                msg.sender,
                params.seller,
                msg.value,
                block.timestamp
            )
        );

        EscrowAgreement storage agreement = escrows[escrowId];
        agreement.buyer = msg.sender;
        agreement.seller = params.seller;
        agreement.amount = msg.value;
        agreement.createdAt = block.timestamp;
        agreement.releaseTime = block.timestamp + (params.timeline * 1 days);
        agreement.projectId = params.projectId;
        
        _setupMilestones(agreement, params.milestoneAmounts, params.milestoneDueDates);
        _setupArbitrators(agreement, escrowId, params.arbitrators);

        emit ProjectEscrowCreated(
            escrowId,
            msg.sender,
            params.seller,
            params.projectId,
            msg.value,
            params.milestoneAmounts.length
        );
    }

    function _setupMilestones(
        EscrowAgreement storage agreement,
        uint256[] calldata amounts,
        uint256[] calldata dueDates
    ) private {
        for (uint256 i = 0; i < amounts.length; i++) {
            agreement.milestones[i] = Milestone({
                amount: amounts[i],
                dueDate: dueDates[i],
                isCompleted: false,
                isPaid: false,
                completionTime: 0,
                completedBy: address(0)
            });
        }
        agreement.milestoneCount = amounts.length;
    }

    function _setupArbitrators(
        EscrowAgreement storage agreement,
        bytes32 escrowId,
        address[] calldata arbitrators
    ) private {
        for (uint256 i = 0; i < arbitrators.length; i++) {
            require(!isBlacklisted[arbitrators[i]], "Arbitrator is blacklisted");
            agreement.arbitrators.push(arbitrators[i]);
            agreement.isArbitrator[arbitrators[i]] = true;
            emit ArbitratorAdded(escrowId, arbitrators[i]);
        }
    }

    function completeMilestone(bytes32 escrowId, uint256 milestoneId)
        external
        onlyParties(escrowId)
        notBlacklisted
        whenNotPaused
        nonReentrant
    {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(milestoneId < agreement.milestoneCount, "Invalid milestone");
        require(!agreement.milestones[milestoneId].isCompleted, "Milestone already completed");

        agreement.milestones[milestoneId].isCompleted = true;
        agreement.milestones[milestoneId].completionTime = block.timestamp;
        agreement.milestones[milestoneId].completedBy = msg.sender;

        emit MilestoneCompleted(escrowId, milestoneId, msg.sender);
    }

    function releaseMilestonePayment(bytes32 escrowId, uint256 milestoneId) 
        external 
        onlyParties(escrowId) 
        notBlacklisted 
        whenNotPaused 
        nonReentrant 
    {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(milestoneId < agreement.milestoneCount, "Invalid milestone");
        require(agreement.milestones[milestoneId].isCompleted, "Milestone not completed");
        require(!agreement.milestones[milestoneId].isPaid, "Milestone already paid");

        uint256 milestoneAmount = agreement.milestones[milestoneId].amount;
        uint256 fee = (milestoneAmount * feePercentage) / 10000;
        uint256 amountToRelease = milestoneAmount - fee;

        agreement.milestones[milestoneId].isPaid = true;
        
        (bool success, ) = payable(agreement.seller).call{value: amountToRelease}("");
        require(success, "Transfer failed");
        
        (success, ) = payable(owner()).call{value: fee}("");
        require(success, "Fee transfer failed");

        emit MilestonePaid(escrowId, milestoneId, amountToRelease);
    }

    function initiateDispute(bytes32 escrowId) 
        external 
        onlyParties(escrowId) 
        notBlacklisted 
        whenNotPaused 
    {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(!agreement.isReleased, "Funds already released");
        require(!agreement.isDisputed, "Dispute already initiated");
        require(agreement.disputeCount < maxDisputesPerEscrow, "Max disputes reached");
        require(
            block.timestamp >= agreement.lastDisputeTime + disputeCooldownPeriod,
            "Dispute cooldown period not passed"
        );

        agreement.isDisputed = true;
        agreement.disputeCount++;
        agreement.lastDisputeTime = block.timestamp;
        userDisputeCount[msg.sender]++;

        emit DisputeInitiated(escrowId, msg.sender);
    }

    function resolveDispute(bytes32 escrowId, address winner) 
        external 
        onlyArbitrator(escrowId) 
        whenNotPaused 
        nonReentrant 
    {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(agreement.isDisputed, "No dispute to resolve");
        require(!agreement.isReleased, "Funds already released");
        require(
            winner == agreement.buyer || winner == agreement.seller,
            "Invalid winner"
        );

        uint256 fee = (agreement.amount * feePercentage) / 10000;
        uint256 amountToRelease = agreement.amount - fee;

        agreement.isReleased = true;
        
        (bool success, ) = payable(winner).call{value: amountToRelease}("");
        require(success, "Transfer failed");
        
        (success, ) = payable(owner()).call{value: fee}("");
        require(success, "Fee transfer failed");

        emit DisputeResolved(escrowId, winner, amountToRelease);
    }

    function addArbitrator(bytes32 escrowId, address arbitrator) 
        external 
        onlyParties(escrowId) 
        whenNotPaused 
    {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(!agreement.isArbitrator[arbitrator], "Already an arbitrator");
        require(agreement.arbitrators.length < maxArbitratorsPerEscrow, "Max arbitrators reached");
        require(!isBlacklisted[arbitrator], "Arbitrator is blacklisted");

        agreement.arbitrators.push(arbitrator);
        agreement.isArbitrator[arbitrator] = true;
        emit ArbitratorAdded(escrowId, arbitrator);
    }

    function removeArbitrator(bytes32 escrowId, address arbitrator) 
        external 
        onlyParties(escrowId) 
        whenNotPaused 
    {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(agreement.isArbitrator[arbitrator], "Not an arbitrator");
        require(!agreement.isDisputed, "Cannot remove during dispute");

        agreement.isArbitrator[arbitrator] = false;
        for (uint256 i = 0; i < agreement.arbitrators.length; i++) {
            if (agreement.arbitrators[i] == arbitrator) {
                agreement.arbitrators[i] = agreement.arbitrators[agreement.arbitrators.length - 1];
                agreement.arbitrators.pop();
                break;
            }
        }
        emit ArbitratorRemoved(escrowId, arbitrator);
    }

    function setBlacklist(address user, bool blacklisted) external onlyOwner {
        isBlacklisted[user] = blacklisted;
        emit UserBlacklisted(user, blacklisted);
    }

    function updateFeePercentage(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= MAX_FEE_PERCENTAGE, "Fee too high");
        feePercentage = _newFeePercentage;
    }

    function updateAmountLimits(
        uint256 _minAmount,
        uint256 _maxAmount
    ) external onlyOwner {
        minEscrowAmount = _minAmount;
        maxEscrowAmount = _maxAmount;
    }

    function updateDisputeSettings(
        uint256 _maxDisputes,
        uint256 _cooldownPeriod,
        uint256 _maxArbitrators
    ) external onlyOwner {
        maxDisputesPerEscrow = _maxDisputes;
        disputeCooldownPeriod = _cooldownPeriod;
        maxArbitratorsPerEscrow = _maxArbitrators;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function getEscrowDetails(bytes32 escrowId) external view returns (
        address buyer,
        address seller,
        uint256 amount,
        uint256 createdAt,
        uint256 releaseTime,
        bool isReleased,
        bool isDisputed,
        uint256 projectId,
        uint256 milestoneCount,
        uint256 disputeCount,
        address[] memory arbitrators
    ) {
        EscrowAgreement storage agreement = escrows[escrowId];
        return (
            agreement.buyer,
            agreement.seller,
            agreement.amount,
            agreement.createdAt,
            agreement.releaseTime,
            agreement.isReleased,
            agreement.isDisputed,
            agreement.projectId,
            agreement.milestoneCount,
            agreement.disputeCount,
            agreement.arbitrators
        );
    }

    function getMilestoneDetails(
        bytes32 escrowId,
        uint256 milestoneId
    ) external view returns (
        uint256 amount,
        uint256 dueDate,
        bool isCompleted,
        bool isPaid,
        uint256 completionTime,
        address completedBy
    ) {
        Milestone storage milestone = escrows[escrowId].milestones[milestoneId];
        return (
            milestone.amount,
            milestone.dueDate,
            milestone.isCompleted,
            milestone.isPaid,
            milestone.completionTime,
            milestone.completedBy
        );
    }

    function requestExtension(
        bytes32 escrowId,
        uint256 milestoneId,
        uint256 newDueDate
    ) external onlyParties(escrowId) notBlacklisted whenNotPaused {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(milestoneId < agreement.milestoneCount, "Invalid milestone");
        require(!agreement.milestones[milestoneId].isCompleted, "Milestone already completed");
        require(newDueDate > agreement.milestones[milestoneId].dueDate, "New date must be later");
        require(
            msg.sender == agreement.seller,
            "Only seller can request extension"
        );

        uint256 requestId = agreement.extensionRequestCount++;
        agreement.extensionRequests[requestId] = ExtensionRequest({
            milestoneId: milestoneId,
            newDueDate: newDueDate,
            requestedAt: block.timestamp,
            isApproved: false,
            isRejected: false,
            requestedBy: msg.sender
        });

        emit ExtensionRequested(escrowId, milestoneId, newDueDate, msg.sender);
    }

    function approveExtension(
        bytes32 escrowId,
        uint256 requestId
    ) external onlyParties(escrowId) notBlacklisted whenNotPaused {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(requestId < agreement.extensionRequestCount, "Invalid request");
        ExtensionRequest storage request = agreement.extensionRequests[requestId];
        require(!request.isApproved && !request.isRejected, "Request already processed");
        require(
            msg.sender == agreement.buyer,
            "Only buyer can approve extension"
        );

        request.isApproved = true;
        agreement.milestones[request.milestoneId].dueDate = request.newDueDate;

        emit ExtensionApproved(escrowId, request.milestoneId, request.newDueDate);
    }

    function rejectExtension(
        bytes32 escrowId,
        uint256 requestId
    ) external onlyParties(escrowId) notBlacklisted whenNotPaused {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(requestId < agreement.extensionRequestCount, "Invalid request");
        ExtensionRequest storage request = agreement.extensionRequests[requestId];
        require(!request.isApproved && !request.isRejected, "Request already processed");
        require(
            msg.sender == agreement.buyer,
            "Only buyer can reject extension"
        );

        request.isRejected = true;

        emit ExtensionRejected(escrowId, request.milestoneId);
    }

    function requestRevision(
        bytes32 escrowId,
        uint256 milestoneId,
        string calldata description,
        uint256 newAmount,
        uint256 newDueDate
    ) external onlyParties(escrowId) notBlacklisted whenNotPaused {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(milestoneId < agreement.milestoneCount, "Invalid milestone");
        require(!agreement.milestones[milestoneId].isCompleted, "Milestone already completed");
        require(
            msg.sender == agreement.buyer,
            "Only buyer can request revision"
        );
        require(
            newDueDate > agreement.milestones[milestoneId].dueDate,
            "New date must be later"
        );

        uint256 requestId = agreement.revisionRequestCount++;
        agreement.revisionRequests[requestId] = RevisionRequest({
            milestoneId: milestoneId,
            description: description,
            requestedAt: block.timestamp,
            isApproved: false,
            isRejected: false,
            requestedBy: msg.sender,
            newAmount: newAmount,
            newDueDate: newDueDate
        });

        emit RevisionRequested(escrowId, milestoneId, description, newAmount, newDueDate, msg.sender);
    }

    function approveRevision(
        bytes32 escrowId,
        uint256 requestId
    ) external onlyParties(escrowId) notBlacklisted whenNotPaused {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(requestId < agreement.revisionRequestCount, "Invalid request");
        RevisionRequest storage request = agreement.revisionRequests[requestId];
        require(!request.isApproved && !request.isRejected, "Request already processed");
        require(
            msg.sender == agreement.seller,
            "Only seller can approve revision"
        );

        request.isApproved = true;
        agreement.milestones[request.milestoneId].amount = request.newAmount;
        agreement.milestones[request.milestoneId].dueDate = request.newDueDate;

        emit RevisionApproved(escrowId, request.milestoneId, request.newAmount, request.newDueDate);
    }

    function rejectRevision(
        bytes32 escrowId,
        uint256 requestId
    ) external onlyParties(escrowId) notBlacklisted whenNotPaused {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(requestId < agreement.revisionRequestCount, "Invalid request");
        RevisionRequest storage request = agreement.revisionRequests[requestId];
        require(!request.isApproved && !request.isRejected, "Request already processed");
        require(
            msg.sender == agreement.seller,
            "Only seller can reject revision"
        );

        request.isRejected = true;

        emit RevisionRejected(escrowId, request.milestoneId);
    }

    function requestCancellation(bytes32 escrowId) 
        external 
        onlyParties(escrowId) 
        notBlacklisted 
        whenNotPaused 
    {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(!agreement.isCancelled, "Escrow already cancelled");
        require(!agreement.isReleased, "Funds already released");
        require(
            agreement.cancellationRequestedAt == 0,
            "Cancellation already requested"
        );

        agreement.cancellationRequestedAt = block.timestamp;
        agreement.cancellationRequestedBy = msg.sender;

        emit CancellationRequested(escrowId, msg.sender, block.timestamp);
    }

    function approveCancellation(bytes32 escrowId) 
        external 
        onlyParties(escrowId) 
        notBlacklisted 
        whenNotPaused 
        nonReentrant 
    {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(!agreement.isCancelled, "Escrow already cancelled");
        require(!agreement.isReleased, "Funds already released");
        require(
            agreement.cancellationRequestedAt > 0,
            "No cancellation requested"
        );
        require(
            msg.sender != agreement.cancellationRequestedBy,
            "Cannot approve own request"
        );

        agreement.cancellationApproved = true;
        agreement.isCancelled = true;

        uint256 completedWorkValue = (agreement.amount * agreement.completedWorkPercentage) / 100;
        uint256 cancellationFee = (completedWorkValue * feePercentage) / 10000;
        uint256 amountToReturn = agreement.amount - completedWorkValue - cancellationFee;

        // Return funds to buyer
        (bool success, ) = payable(agreement.buyer).call{value: amountToReturn}("");
        require(success, "Transfer failed");

        // Pay completed work to seller
        (success, ) = payable(agreement.seller).call{value: completedWorkValue}("");
        require(success, "Transfer failed");

        // Pay cancellation fee to owner
        (success, ) = payable(owner()).call{value: cancellationFee}("");
        require(success, "Fee transfer failed");

        emit EscrowCancelled(escrowId, msg.sender, amountToReturn, cancellationFee);
    }

    function updateMilestoneProgress(
        bytes32 escrowId,
        uint256 milestoneId,
        uint256 progressPercentage,
        string calldata description
    ) external onlyParties(escrowId) notBlacklisted whenNotPaused {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(milestoneId < agreement.milestoneCount, "Invalid milestone");
        require(!agreement.milestones[milestoneId].isCompleted, "Milestone already completed");
        require(progressPercentage <= 100, "Invalid progress percentage");
        require(
            msg.sender == agreement.seller,
            "Only seller can update progress"
        );

        MilestoneProgress storage progress = agreement.milestoneProgress[milestoneId];
        progress.progressPercentage = progressPercentage;
        progress.lastUpdatedAt = block.timestamp;
        progress.updatedBy = msg.sender;
        progress.progressDescription = description;

        // Update overall escrow progress
        uint256 totalProgress = 0;
        for (uint256 i = 0; i < agreement.milestoneCount; i++) {
            totalProgress += agreement.milestoneProgress[i].progressPercentage;
        }
        agreement.completedWorkPercentage = totalProgress / agreement.milestoneCount;

        emit MilestoneProgressUpdated(
            escrowId,
            milestoneId,
            progressPercentage,
            description,
            msg.sender
        );
    }

    function verifyMilestoneProgress(
        bytes32 escrowId,
        uint256 milestoneId,
        bool passed
    ) external onlyParties(escrowId) notBlacklisted whenNotPaused {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(milestoneId < agreement.milestoneCount, "Invalid milestone");
        require(!agreement.milestones[milestoneId].isCompleted, "Milestone already completed");
        require(
            msg.sender == agreement.buyer,
            "Only buyer can verify progress"
        );

        MilestoneProgress storage progress = agreement.milestoneProgress[milestoneId];
        require(!progress.isVerified, "Progress already verified");

        progress.isVerified = true;
        progress.verificationPassed = passed;
        progress.verificationEndTime = block.timestamp;

        emit MilestoneProgressVerified(escrowId, milestoneId, passed, msg.sender);
    }

    function getMilestoneProgress(
        bytes32 escrowId,
        uint256 milestoneId
    ) external view returns (
        uint256 progressPercentage,
        uint256 lastUpdatedAt,
        address updatedBy,
        string memory progressDescription,
        bool isVerified,
        bool verificationPassed
    ) {
        MilestoneProgress storage progress = escrows[escrowId].milestoneProgress[milestoneId];
        return (
            progress.progressPercentage,
            progress.lastUpdatedAt,
            progress.updatedBy,
            progress.progressDescription,
            progress.isVerified,
            progress.verificationPassed
        );
    }

    function depositInsurance() 
        external 
        payable 
        notBlacklisted 
        whenNotPaused 
    {
        require(msg.value >= insurancePool.minDeposit, "Deposit too small");
        
        insurancePool.totalDeposits += msg.value;
        insurancePool.userDeposits[msg.sender] += msg.value;

        emit InsuranceDeposited(msg.sender, msg.value, insurancePool.totalDeposits);
    }

    function withdrawInsurance(uint256 amount) external notBlacklisted whenNotPaused {
        require(amount <= insurancePool.userDeposits[msg.sender], "Insufficient deposit");
        require(
            insurancePool.totalDeposits - amount >= insurancePool.totalClaims,
            "Cannot withdraw below required coverage"
        );

        insurancePool.totalDeposits -= amount;
        insurancePool.userDeposits[msg.sender] -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function purchaseInsurance(bytes32 escrowId, uint256 amount) 
        external 
        payable
        onlyParties(escrowId) 
        notBlacklisted 
        whenNotPaused 
    {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(!agreement.isReleased, "Escrow already released");
        require(amount <= insurancePool.maxCoveragePerEscrow, "Amount exceeds max coverage");
        
        uint256 insuranceFee = (amount * insuranceFeePercentage) / 10000;
        require(msg.value >= amount + insuranceFee, "Insufficient payment");

        agreement.insuranceAmount = amount;
        
        // Pay insurance fee to owner
        (bool success, ) = payable(owner()).call{value: insuranceFee}("");
        require(success, "Fee transfer failed");

        // Add to insurance pool
        insurancePool.totalDeposits += amount;
    }

    function claimInsurance(bytes32 escrowId) 
        external 
        onlyParties(escrowId) 
        notBlacklisted 
        whenNotPaused 
    {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(agreement.insuranceAmount > 0, "No insurance purchased");
        require(!agreement.insuranceClaimed, "Insurance already claimed");
        require(
            agreement.qualityAssurancePeriod > 0 && 
            block.timestamp > agreement.qualityAssuranceEndTime,
            "Quality assurance period not ended"
        );
        require(!agreement.qualityAssurancePassed, "Quality assurance passed");

        agreement.insuranceClaimed = true;
        agreement.insuranceClaimTime = block.timestamp;
        agreement.insuranceClaimedBy = msg.sender;

        emit InsuranceClaimed(
            escrowId,
            msg.sender,
            agreement.insuranceAmount,
            block.timestamp
        );
    }

    function processInsuranceClaim(bytes32 escrowId, bool approve) 
        external 
        onlyArbitrator(escrowId)
        notBlacklisted 
        whenNotPaused 
        nonReentrant 
    {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(agreement.insuranceClaimed, "No insurance claim");
        require(
            block.timestamp >= agreement.insuranceClaimTime + insurancePool.claimProcessingTime,
            "Claim processing time not elapsed"
        );

        if (approve) {
            require(
                insurancePool.totalDeposits >= agreement.insuranceAmount,
                "Insufficient insurance pool"
            );

            insurancePool.totalClaims += agreement.insuranceAmount;
            insurancePool.userClaims[agreement.insuranceClaimedBy] += agreement.insuranceAmount;

            (bool success, ) = payable(agreement.insuranceClaimedBy).call{
                value: agreement.insuranceAmount
            }("");
            require(success, "Transfer failed");
        }

        emit InsuranceClaimProcessed(escrowId, approve, msg.sender);
    }

    function startQualityAssurance(
        bytes32 escrowId,
        uint256 period
    ) external onlyParties(escrowId) notBlacklisted whenNotPaused {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(agreement.isReleased, "Escrow not released");
        require(agreement.qualityAssurancePeriod == 0, "QA already started");

        agreement.qualityAssurancePeriod = period;
        agreement.qualityAssuranceEndTime = block.timestamp + period;

        emit QualityAssuranceStarted(
            escrowId,
            period,
            agreement.qualityAssuranceEndTime
        );
    }

    function verifyQualityAssurance(
        bytes32 escrowId,
        bool passed
    ) external onlyParties(escrowId) notBlacklisted whenNotPaused {
        EscrowAgreement storage agreement = escrows[escrowId];
        require(agreement.qualityAssurancePeriod > 0, "QA not started");
        require(
            block.timestamp > agreement.qualityAssuranceEndTime,
            "QA period not ended"
        );
        require(!agreement.qualityAssurancePassed, "QA already verified");
        require(
            msg.sender == agreement.buyer,
            "Only buyer can verify QA"
        );

        agreement.qualityAssurancePassed = passed;
        agreement.qualityAssuranceVerifier = msg.sender;

        if (passed) {
            emit QualityAssurancePassed(escrowId, msg.sender);
        } else {
            emit QualityAssuranceFailed(escrowId, msg.sender);
        }
    }

    function getInsuranceInfo() external view returns (
        uint256 totalDeposits,
        uint256 totalClaims,
        uint256 maxCoveragePerEscrow,
        uint256 minDeposit,
        uint256 claimProcessingTime
    ) {
        return (
            insurancePool.totalDeposits,
            insurancePool.totalClaims,
            insurancePool.maxCoveragePerEscrow,
            insurancePool.minDeposit,
            insurancePool.claimProcessingTime
        );
    }

    function getUserInsuranceInfo(address user) external view returns (
        uint256 deposit,
        uint256 claims
    ) {
        return (
            insurancePool.userDeposits[user],
            insurancePool.userClaims[user]
        );
    }

    // Make receive function to accept direct ETH transfers
    receive() external payable {
        // Allow contract to receive ETH
    }

    // Fallback function in case someone sends ETH with data
    fallback() external payable {
        // Allow contract to receive ETH with data
    }
} 