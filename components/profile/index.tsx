import { Box, Button, Flex, HStack, Image, Modal, ModalCloseButton, ModalContent, ModalOverlay, Text, VStack } from "@chakra-ui/react"
import useApp from "components/context/app-context";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { toast } from "react-toastify";
import { findOrAddUser } from "utils/firestore";
import { WalletSignResult } from "utils/types";
import { connectEthereum, connectSolana } from "utils/web3";

const Profile = () => {
    const [ open, setOpen ] = useState(false);
    const { user } = useApp();

    return (
        <Box>
            {user ? (
                <Button colorScheme="purple">{user.id.replace(user.id.substring(7, user.id.length-6), "...")}</Button>
            ) : (
                <Button onClick={() => {
                    setOpen(true);
                }} colorScheme="purple">
                    Signup with wallet
                </Button>
            )}
            <SignupModal open={open} setOpen={setOpen}/>
        </Box>
    )
}

export default Profile;

export const SignupModal = ({open, setOpen} : {open: boolean, setOpen: Function}) => {
    const { setUser } = useApp();
    const router = useRouter();

    const register = (res: object | null) => {
        if (res) {
            const { address, signature } = res as WalletSignResult;
            findOrAddUser(address, signature).then(user => {
                if (setUser) {
                    setUser(user);
                    localStorage.setItem('user', JSON.stringify(user ?? undefined));
                    if (user) {
                        router.push('/dashboard', {scroll: false});
                    } else {
                        toast.error("Wrong signature! Try again!");
                        router.push('/', {scroll: false});
                    }
                }
            })
        }
    }
    return (
        <Modal isOpen={open} onClose={() => {
            setOpen(false);
        }}>
            <ModalOverlay />
            <ModalContent mt={'10%'}>
                <ModalCloseButton />
                <Flex direction={'column'} alignItems={"center"} gap={2} m={10}>
                    <Text fontSize={'3xl'}>Sign up with your wallet</Text>
                    <Text fontSize={'lg'} mt={'-2'}>Connect wallet to assign payee address</Text>
                    <HStack my={4} gap={12}>
                        <VStack cursor={'pointer'} p={4} borderRadius={8} transition={'0.2s ease'} _hover={{bg: "#646464"}} onClick={() => {
                            connectEthereum().then(res => register(res));
                            setOpen(false)
                        }}>
                            <Image src="/static/images/ethereum.svg" h={20} alt="Ethereum"/>
                            <Text fontSize={'lg'}>Ethereum</Text>
                        </VStack>
                        <VStack cursor={'pointer'} p={4} borderRadius={8} transition={'0.2s ease'} _hover={{bg: "#646464"}} onClick={() => {
                            connectSolana().then(res => register(res));
                            setOpen(false)
                        }}>
                            <Image src="/static/images/solana.svg" h={20} alt="Solana"/>
                            <Text fontSize={'lg'}>Solana</Text>
                        </VStack>
                    </HStack>
                </Flex>
            </ModalContent>
        </Modal>
    );
}