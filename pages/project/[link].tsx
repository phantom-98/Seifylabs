import { Box, Button, Container, Flex, Grid, GridItem, Heading, HStack, Image, Modal, ModalCloseButton, ModalContent, ModalOverlay, Text, Textarea } from "@chakra-ui/react";
import * as React from "react";
import { useRouter } from "next/router";
import { DatePicker, DatePickerCalendar, DatePickerTimeField } from "@saas-ui/date-picker";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { getProject, updateProject } from "utils/firestore";
import { formatWalletAddress } from "utils/web3";
import { ProjectType } from "utils/types";
import { parseDate } from "@internationalized/date";

const Project = () => {

    const router = useRouter();
    const [balance, setBalance] = React.useState(0);
    const [payeeAddress, setPayeeAddress] = React.useState('0xf76359e6a368b44269601354cB09d94365Cd70D7')
    const [open, setOpen] = React.useState(false);
    const [step, setStep] = React.useState(1);
    const [project, setProject] = React.useState<ProjectType>();
    const [spinner, setSpinner] = React.useState(false);

    const accept = async () => {
        if (!payeeAddress) return;
        setSpinner(true);
        await updateProject(`${router.query.link}`, {
            ...project,
            status: "Accepted",
            payeeAddress
        })
        setStep(2);
        setSpinner(false);
    }
    const reject = async () => {
        await updateProject(`${router.query.link}`, {
            ...project,
            status: "Rejected",
        })
        router.push('/dashboard');
    }

    React.useEffect(() => {
        async function fetch() {
            if (router.query.link) {
                const project = await getProject(`${router.query.link}`);
                setProject({...project} as ProjectType);
            }
        }
        fetch();
    }, [router.query.link])

    return (
        <Container px="8" py="32" maxW="container.2xl">
            <Flex direction={`column`} alignItems={"center"} gap={16} textAlign={"center"} mt={'10'}>
                <Heading size={'xl'}>Project Proposal of {`"${project?.title}"`}</Heading>
                <Flex justify={'space-between'} alignItems={'start'} gap={32}>
                    <Flex direction={'column'} alignItems={'start'} gap={2}>
                        <Text fontSize={'2xl'}>Scope of Work</Text>
                        <Textarea h={'200px'} w={'400px'} value={project?.scope}/>

                        <Text fontSize={'2xl'}>Deliverables</Text>
                        <Text fontSize={'lg'} mt={'-2'}>What should payee deliver</Text>
                        <Textarea h={'200px'} w={'400px'} value={project?.deliverable}/>
                    </Flex>
                    <Flex direction={'column'} align={'start'} gap={12}>
                        <Grid gridTemplateColumns={'1fr 1fr'} gap={'20px 64px'} textAlign={"left"}>
                            <GridItem>
                                <Text fontSize={'2xl'}>Payer Wallet</Text>
                                <Text fontSize={'lg'}>Wallet Connected: {formatWalletAddress(project?.address)}</Text>
                            </GridItem>
                            <GridItem>
                                <Text fontSize={'2xl'}>Payee Wallet</Text>
                                <Text fontSize={'lg'}>Wallet Connected: {formatWalletAddress(payeeAddress)}</Text>
                            </GridItem>
                            <GridItem>
                                <Text fontSize={'2xl'}>Amount to be paid</Text>
                                <Flex border={`1px solid white`} borderRadius={8} py={1} px={2} gap={4} width={'max-content'}>
                                    <Text>{project?.amount} {project?.token}</Text>
                                    <Image
                                        src={`/static/images/${project?.token === "USDC" ? "usdc": project?.token === "ETH" ? "ethereum": project?.token === "SOL" ? "solana" : "bitcoin"}.svg`}
                                        alt={project?.token}
                                        h={6}
                                        w={6}
                                        borderRadius={`full`}
                                        border={`2px solid white`}
                                    />
                                </Flex>
                            </GridItem>
                        </Grid>
                        <Flex direction={'column'} align={'start'} gap={2}>
                            <Text fontSize={'2xl'}>Timeline</Text>
                            <Text fontSize={'lg'} mt={'-2'}>By when should payee deliver the work?</Text>
                            <Box bg={'#171717'} p={4}>
                                <DatePicker value={ project?.deadline ? parseDate(project.deadline) : null } isReadOnly>
                                    <DatePickerCalendar />
                                    <DatePickerTimeField />
                                </DatePicker>
                            </Box>
                        </Flex>
                    </Flex>
                </Flex>
                <Flex alignItems={"center"} justify={'end'} gap={4} w={'full'} mt={'8'}>
                    <Button fontSize={'medium'} p={4} colorScheme="purple" onClick={() => setOpen(true)}>Accept</Button>
                    <Button fontSize={'medium'} p={4} colorScheme="purple" onClick={() => {
                        reject();
                    }}>Reject</Button>
                </Flex>
                <Modal isOpen={open} onClose={() => {
                    setOpen(false);
                    setStep(1);
                    router.push("/dashboard");
                }}>
                    <ModalOverlay />
                    <ModalContent maxW={'600px'} mt={64} borderRadius={16}>
                        <ModalCloseButton />
                        {step === 1 ? (
                            <Flex direction={'column'} alignItems={"center"} gap={2} m={10}>
                                <Text fontSize={'2xl'}>Accept Proposal</Text>
                                <hr style={{borderTop: "1px solid white", width: "100px", marginBottom: "12px"}}/>
                                <Flex direction={'column'} align={'start'} gap={2}>
                                    <Text fontSize={'lg'} mt={'-2'}>Connect wallet to assign payee address</Text>
                                    <HStack my={4} gap={6}>
                                        <Button
                                            leftIcon={<Image src="/static/images/phantom.png" h={8} alt="Phantom"/>} 
                                            size={'lg'}
                                            p={4}
                                            colorScheme="whiteAlpha"
                                            variant="solid"
                                            onClick={() => {}}
                                        ><Text fontSize={'lg'} color={'black'}>Phantom</Text></Button>
                                        <Button
                                            leftIcon={<Image src="/static/images/metamask.png" h={8} alt="Metamask"/>} 
                                            size={'lg'}
                                            p={4}
                                            colorScheme="whiteAlpha"
                                            variant="solid"
                                            onClick={() => {}}
                                        ><Text fontSize={'lg'} color={'black'}>Metamask</Text></Button>
                                    </HStack>
                                    <Text fontSize={'md'}>Wallet Connected: {formatWalletAddress(payeeAddress)}</Text>
                                    <Text fontSize={'md'} color="#8952e0">{project?.token} Balance: {balance} {project?.token}</Text>
                                </Flex>
                                <Button fontSize={'medium'} p={4} colorScheme="purple" onClick={() => {
                                    accept();
                                }} isLoading={spinner}>Accept</Button>
                            </Flex>
                        ) : (
                            <Flex direction={'column'} alignItems={"center"} gap={6} m={10}>
                                <Text fontSize={'2xl'}>Proposal Accepted</Text>
                                <CheckCircleIcon color={'green'} boxSize={20}/>
                                <Button fontSize={'medium'} p={4} colorScheme="purple" onClick={() => {
                                    setOpen(false);
                                    setStep(1);
                                    router.push("/dashboard");
                                }}>Close</Button>
                            </Flex>
                        )}
                    </ModalContent>
                </Modal>
            </Flex>
        </Container>
    )



}

export default Project;