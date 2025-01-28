import { CopyIcon } from "@chakra-ui/icons";
import { Box, Button, Container, Flex, Heading, HStack, Image, Input, Modal, ModalCloseButton, ModalContent, ModalOverlay, Text, Textarea, Tooltip } from "@chakra-ui/react";
import { DatePicker, DatePickerCalendar, DatePickerTimeField, DateValue } from "@saas-ui/date-picker";
import * as React from "react";
import { useRouter } from "next/navigation";
import { saveProject } from "utils/firestore";
import { formatWalletAddress } from "utils/web3";
import useApp from "components/context/app-context";

const CreateProject = () => {
    const { checkIfAuthenticated } = useApp();
    const [ step, setStep ] = React.useState(1);
    const [ title, setTitle ] = React.useState('');
    const [ scope, setScope ] = React.useState('');
    const [ token, setToken ] = React.useState("USDC");
    const [ wallet, setWallet ] = React.useState("Phantom");
    const [ address, setAddress ] = React.useState('As26QHR2AiH6DBhaRnaJqvNBPLbbiUppbZm19sdbMZKx');
    const [ balance, setBalance ] = React.useState(145)
    const [ amount, setAmount ] = React.useState(0);
    const [ deliverable, setDeliverable ] = React.useState('');
    const [ deadline, setDeadline ] = React.useState('');
    const [ link, setLink ] = React.useState('');
    const [ tooltip, setTooltip ] = React.useState(false);
    const [ spinner, setSpinner ] = React.useState(false);
    const router = useRouter();

    const submit = async () => {
        setSpinner(true);
        const id = await saveProject({
            title,
            scope,
            token,
            wallet,
            address,
            amount,
            deliverable,
            deadline,
            createdAt: new Date()
        });
        setSpinner(false);
        setLink(id);
    }

    React.useEffect(() => {
        checkIfAuthenticated && checkIfAuthenticated();
    }, [checkIfAuthenticated])

    return (
        <Container px="8" py="32" maxW="container.2xl">
            {step === 1 ? (
                    <Flex direction={`column`} alignItems={"center"} gap={16} textAlign={"center"} my={'40'}>
                        <Heading size={'xl'}>Select Role</Heading>
                        <Flex direction={'column'} alignItems={'center'} gap={8}>
                            <Text fontSize={'2xl'}>Are you the service provider (Payee) or the service requester (Payer)?</Text>
                            <Flex alignItems={"center"} justify={'center'} gap={8}>
                                <Button fontSize={'large'} p={5} colorScheme="purple" onClick={() => setStep(2)}>Payer</Button>
                                <Button fontSize={'large'} p={5} colorScheme="purple" isDisabled>Payee</Button>
                            </Flex>
                        </Flex>
                    </Flex>
                ) : step === 2 ? (
                    <Flex direction={`column`} alignItems={"center"} gap={16} textAlign={"center"} mt={'24'}>
                        <Heading size={'xl'}>Project Details</Heading>
                        <Flex direction={'column'} alignItems={'start'} gap={2} minW={'640px'}>
                            <Text fontSize={'2xl'}>Project Title</Text>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)}/>
                            <Text fontSize={'2xl'}>Scope of Work</Text>
                            <Text fontSize={'lg'} mt={'-2'}>Give details about the project</Text>
                            <Textarea h={'300px'} value={scope} onChange={(e) => setScope(e.target.value)}/>
                            <Flex alignItems={"center"} justify={'end'} gap={4} w={'full'} mt={'8'}>
                                <Button fontSize={'medium'} p={4} colorScheme="purple" onClick={() => setStep(1)}>{`<`} Previous</Button>
                                <Button fontSize={'medium'} py={4} px={8} colorScheme="purple" onClick={() => setStep(3)}>Next {`>`}</Button>
                            </Flex>
                        </Flex>
                    </Flex>
                ) : step === 3 ? (
                    <Flex direction={`column`} alignItems={"center"} gap={16} textAlign={"center"} mt={'16'}>
                        <Heading size={'xl'}>Project Details</Heading>
                        <Flex direction={'column'} alignItems={'start'} gap={4} minW={'640px'}>
                            <Flex direction={'column'} alignItems={'start'} gap={2}>
                                <Text fontSize={'2xl'}>Select Crypto Blockchain</Text>
                                <Text fontSize={'lg'} mt={'-2'}>Which cryptocurrency will you use to pay payee?</Text>
                                <HStack my={8}>
                                    <Button
                                        leftIcon={<Image src="/static/images/usdc.svg" h={6} alt="USDC"/>} 
                                        size={'lg'}
                                        p={2}
                                        colorScheme="whiteAlpha"
                                        variant="solid"
                                        isActive={token === "USDC"}
                                        onClick={() => setToken("USDC")}
                                    ><Text fontSize={'lg'} color={'black'}>USDC</Text></Button>
                                    <Button
                                        leftIcon={<Image src="/static/images/ethereum.svg" h={6} alt="Ethereum"/>} 
                                        size={'lg'}
                                        p={2}
                                        colorScheme="whiteAlpha"
                                        variant="solid"
                                        isActive={token === "ETH"}
                                        onClick={() => setToken("ETH")}
                                    ><Text fontSize={'lg'} color={'black'}>Ethereum</Text></Button>
                                    <Button
                                        leftIcon={<Image src="/static/images/solana.svg" h={6} alt="Solana"/>} 
                                        size={'lg'}
                                        p={2}
                                        colorScheme="whiteAlpha"
                                        variant="solid"
                                        isActive={token === "SOL"}
                                        onClick={() => setToken("SOL")}
                                    ><Text fontSize={'lg'} color={'black'}>Solana</Text></Button>
                                    <Button
                                        leftIcon={<Image src="/static/images/bitcoin.svg" h={6} alt="Bitcoin"/>} 
                                        size={'lg'}
                                        p={2}
                                        colorScheme="whiteAlpha"
                                        variant="solid"
                                        isActive={token === "BTC"}
                                        onClick={() => setToken("BTC")}
                                    ><Text fontSize={'lg'} color={'black'}>Bitcoin</Text></Button>
                                </HStack>
                            </Flex>
                            <Flex direction={'column'} alignItems={'start'} gap={2}>
                                <Text fontSize={'2xl'}>Connect Wallet</Text>
                                <Text fontSize={'lg'} mt={'-2'}>Connect wallet to assign payer wallet address</Text>
                                <HStack my={4} gap={6}>
                                    <Button
                                        leftIcon={<Image src="/static/images/phantom.png" h={8} alt="Phantom"/>} 
                                        size={'lg'}
                                        p={4}
                                        colorScheme="whiteAlpha"
                                        variant="solid"
                                        isActive={wallet === "Phantom"}
                                        onClick={() => {
                                            setWallet("Phantom")
                                        }}
                                    ><Text fontSize={'lg'} color={'black'}>Phantom</Text></Button>
                                    <Button
                                        leftIcon={<Image src="/static/images/metamask.png" h={8} alt="MetaMask"/>} 
                                        size={'lg'}
                                        p={4}
                                        colorScheme="whiteAlpha"
                                        variant="solid"
                                        isActive={wallet === "MetaMask"}
                                        onClick={() => {
                                            setWallet("MetaMask")
                                        }}
                                    ><Text fontSize={'lg'} color={'black'}>MetaMask</Text></Button>
                                </HStack>
                                <Text fontSize={'md'}>Wallet Connected: {formatWalletAddress(address)}</Text>
                                <Text fontSize={'md'} color="#8952e0">{token} Balance: {balance} {token}</Text>
                            </Flex>
                            <Flex direction={'column'} alignItems={'start'} gap={2}>
                                <Text fontSize={'2xl'}>Amount</Text>
                                <Text fontSize={'lg'} mt={'-2'}>How much will the payee receive (cost of project)?</Text>
                                <Flex border={`1px solid white`} borderRadius={8} p={2} gap={4} width={'max-content'}>
                                    <Input
                                        size={'md'} 
                                        variant={'unstyled'}
                                        width={9 * (isNaN(amount) ? 1 : amount.toString().length) + "px"} 
                                        p={0} 
                                        mt={'3px'} 
                                        textAlign={'right'}
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.valueAsNumber)}
                                    />
                                    <Text ml={-2}>{token}</Text>
                                    <Image
                                        src={`/static/images/${token === "USDC" ? "usdc": token === "ETH" ? "ethereum": token === "SOL" ? "solana" : "bitcoin"}.svg`}
                                        alt={token}
                                        h={6}
                                        w={6}
                                        borderRadius={`full`}
                                        border={`2px solid white`}
                                    />
                                </Flex>
                            </Flex>
                            <Flex alignItems={"center"} justify={'end'} gap={4} w={'full'} mt={'8'}>
                                <Button fontSize={'medium'} p={4} colorScheme="purple" onClick={() => setStep(2)}>{`<`} Previous</Button>
                                <Button fontSize={'medium'} py={4} px={8} colorScheme="purple" onClick={() => setStep(4)}>Next {`>`}</Button>
                            </Flex>
                        </Flex>
                    </Flex>
                ) : (
                    <Flex direction={`column`} alignItems={"center"} gap={10} textAlign={"center"} mt={'4'}>
                        <Heading size={'xl'}>Project Details</Heading>
                        <Flex direction={'column'} alignItems={'start'} gap={4} minW={'640px'}>
                            <Flex direction={'column'} alignItems={'start'} gap={2}>
                                <Text fontSize={'2xl'}>Deliverables</Text>
                                <Text fontSize={'lg'} mt={'-2'}>What should payee deliver</Text>
                                <Textarea h={'200px'} w={'640px'} value={deliverable} onChange={(e) => setDeliverable(e.target.value)}/>
                            </Flex>
                            <Flex direction={'column'} alignItems={'start'} gap={2}>
                                <Text fontSize={'2xl'}>Timeline</Text>
                                <Text fontSize={'lg'} mt={'-2'}>By when should payee deliver the work?</Text>
                                <Box bg={'#171717'} p={4}>
                                    <DatePicker onChange={(v) => {setDeadline(v?.toString()??"");}}>
                                        <DatePickerCalendar />
                                        <DatePickerTimeField />
                                    </DatePicker>
                                </Box>
                            </Flex>
                            
                            <Flex alignItems={"center"} justify={'end'} gap={4} w={'full'} mt={'8'}>
                                <Button fontSize={'medium'} p={4} colorScheme="purple" onClick={() => setStep(3)}>{`<`} Previous</Button>
                                <Button fontSize={'medium'} py={4} colorScheme="purple" onClick={() => {
                                    submit();
                                }} isLoading={spinner}>Invite Payee</Button>
                            </Flex>
                        </Flex>
                        <Modal isOpen={!!link} onClose={() => {
                            setLink('');
                            router.push("/dashboard");
                        }}>
                            <ModalOverlay />
                            <ModalContent maxW={'600px'} mt={64} borderRadius={16}>
                                <ModalCloseButton />
                                <Flex direction={'column'} alignItems={"center"} gap={2} m={10}>
                                    <Text fontSize={'2xl'}>Invite Payee</Text>
                                    <Text fontSize={'lg'} mt={'-2'}>Copy the link below and share with Payee</Text>
                                    <Flex alignItems={"center"} gap={2} border={`1px solid white`} borderRadius={'full'} py={1} px={5} my={6}>
                                        <Text>{`${window.location.origin}/project/${link}`}</Text>
                                        <Tooltip hasArrow label="Copied" isOpen={tooltip} bg={'black'} placement="top" borderRadius={6}>
                                            <CopyIcon color={'#8952e0'} cursor={'pointer'} onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/project/${link}`);
                                                setTooltip(true);
                                                setTimeout(() => setTooltip(false), 2000);
                                            }}/>
                                        </Tooltip>
                                    </Flex>
                                    <hr style={{borderTop: "1px solid white", width: "100px", marginBottom: "12px"}}/>
                                    <Text textAlign={'center'} fontSize={'lg'} maxW={'360px'}>The payee will have to go over the project details and accept the deliverables and timeline for escrow and project to begin</Text>
                                </Flex>
                            </ModalContent>
                        </Modal>
                    </Flex>
                )}
        </Container>
    )
}

export default CreateProject;