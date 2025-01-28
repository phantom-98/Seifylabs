import * as React from "react";
import { Button, Container, Flex, Image, Table, TableContainer, Tag, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { SearchInput } from "@saas-ui/react";
import { ButtonLink } from "components/button-link";
import { genQuery, getDocuments, getProjectsCount } from "utils/firestore";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { ProjectType } from "utils/types";
import useApp from "components/context/app-context";

const Dashboard = () => {
    const { user, setUser, checkIfAuthenticated } = useApp();
    const [projects, setProjects] = React.useState<ProjectType[]>([]);
    const [keyword, setKeyword] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [count, setCount] = React.useState(0);
    const [wholeCount, setWholeCount] = React.useState(0);
    const [firstVisible, setFirstVisible] = React.useState<QueryDocumentSnapshot>();
    const [lastVisible, setLastVisible] = React.useState<QueryDocumentSnapshot>();
    const [q, setQuery] = React.useState(genQuery('projects', {
        orderBy: {
            fieldName: "createdAt",
            direct: "desc"
        },
        limit: pageSize
    }));

    const fetch = async () => {
        getProjectsCount().then(count => setWholeCount(count))
        getDocuments(q).then(docs => {
            if (docs.length == 0) {
                setProjects([]);
            } else {
                setFirstVisible(docs[0]);
                setLastVisible(docs[docs.length - 1]);
                setCount(docs.length);
                setProjects(docs.map(doc => ({...doc.data(), id: doc.id} as ProjectType)))
            }
        });
    }

    React.useEffect(() => {
        checkIfAuthenticated && checkIfAuthenticated();
    }, [checkIfAuthenticated])

    React.useEffect(() => {
        fetch();
    }, [q])

    return (
        <Container px="8" py="32" maxW="container.2xl">
            <Flex direction="column" gap="8">
                <Flex direction="row" alignItems="center" justify="space-between">
                    <Flex direction="row" alignItems="center" gap="12">
                        <Text fontSize="2xl" fontWeight="600">My Escrow Project</Text>
                        <Tag size="sm" colorScheme="gray" borderRadius="12">Viewing {count} Projects</Tag>
                    </Flex>
                    <Flex direction="row" alignItems="center" gap="8">
                        <SearchInput value={keyword} onChange={(e) => setKeyword(e.target.value)}/>
                        <ButtonLink href={"/create"} colorScheme="white" px="8">+ Create</ButtonLink>
                    </Flex>
                </Flex>
                <TableContainer border={`1px solid #514f56`} borderRadius={'8'}>
                    <Table>
                        <Thead bg="#414048">
                            <Tr>
                                <Th>Escrow Project</Th>
                                <Th borderInline={`1px solid #514f56`}>Status</Th>
                                <Th>Role</Th>
                                <Th borderInline={`1px solid #514f56`}>Amount</Th>
                                <Th width={36}>Date</Th>
                                <Th width={24}></Th>
                            </Tr>
                        </Thead>
                        <Tbody bg="#292730">
                            {projects.map((project, index) => (
                                <Tr key={index} _hover={{
                                    bg: "#7854fb"
                                }}>
                                    <Td borderBottom={"1px solid #514f56"}>
                                        <Flex align={'center'} gap={'4'}>
                                            <Image src={`/static/images/${project.wallet.toLowerCase()}.png`} alt={project.wallet} width={10}></Image>
                                            <Text>{project.title}</Text>
                                        </Flex>
                                    </Td>
                                    <Td borderInline={`1px solid #514f56`} borderBottom={"1px solid #514f56"}>
                                        <Tag colorScheme={
                                                !project.status ? "gray"
                                                    : project.status.toLowerCase() == "complete"
                                                    ? "green"
                                                    : project.status.toLowerCase() == "in escrow"
                                                    ? "teal"
                                                    : project.status.toLowerCase() == "accepted"
                                                    ? "cyan"
                                                    : project.status.toLowerCase() == "rejected"
                                                    ? "pink"
                                                    : project.status.toLowerCase() == "failed"
                                                    ? "red"
                                                    : "gray"
                                            }
                                            variant={`solid`}
                                            size="lg" 
                                            borderRadius={`full`}
                                        >{project.status ?? "Pending"}</Tag>
                                    </Td>
                                    <Td borderBottom={"1px solid #514f56"}>{"Payer"}</Td>
                                    <Td borderInline={`1px solid #514f56`} borderBottom={"1px solid #514f56"}>{project.amount} {project.token}</Td>
                                    <Td borderBottom={"1px solid #514f56"}>{`${project.deadline}`.substring(0, 10)}</Td>
                                    <Td borderBottom={"1px solid #514f56"}><Tag colorScheme="gray" size="lg" borderRadius={16}>View</Tag></Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
                <Flex direction="row" alignItems="center" justify="space-between">
                    <Flex direction="row" alignItems="center" gap="12">
                        <Text fontSize="md">Showing {(page - 1) * pageSize + 1} to {(page - 1) * pageSize + count} of {wholeCount} results</Text>
                    </Flex>
                    <Flex direction="row" alignItems="center" gap="2">
                        <Button colorScheme="white" px="3" variant="outline" onClick={() => {
                            setPage(page - 1);
                            setQuery(genQuery("projects", {
                                orderBy: {
                                    fieldName: "createdAt",
                                    direct: "desc"
                                },
                                limit: pageSize,
                                endBefore: firstVisible
                            }))
                        }} isDisabled={page <= 1}>{`<`} Previous</Button>
                        <Button colorScheme="white" px="6" variant="outline" onClick={() => {
                            setPage(page + 1);
                            setQuery(genQuery("projects", {
                                orderBy: {
                                    fieldName: "createdAt",
                                    direct: "desc"
                                },
                                limit: pageSize,
                                startAfter: lastVisible
                            }))
                        }} isDisabled={page * pageSize >= wholeCount}>Next {`>`}</Button>
                    </Flex>
                </Flex>
            </Flex>
        </Container>
    )
}

export default Dashboard;