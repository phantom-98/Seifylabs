import { addDoc, and, collection, doc, DocumentData, endBefore, getCountFromServer, getDoc, getDocs, getFirestore, limit, or, orderBy, Query, query, QueryCompositeFilterConstraint, QueryConstraint, QueryDocumentSnapshot, QueryNonFilterConstraint, setDoc, startAfter, where } from "firebase/firestore";
import firebaseApp from './firebaseConfig';
import { Filter, User } from "./types";

const db = getFirestore(firebaseApp);
export default db;

export const saveDocument = async (collectionName: string, document: object) : Promise<string> => {
    const snapshot = await addDoc(collection(db, collectionName), document);
    return snapshot.id;
}

export const getDocument = async (collectionName: string, id: string) : Promise<DocumentData | null> => {
    const snapshot = await getDoc(doc(db, collectionName, id));
    if (snapshot.exists()) {
        return snapshot.data();
    } else {
        return null;
    }
}

export const getDocuments = async (q: Query) : Promise<QueryDocumentSnapshot[]> => {
    const docs = await getDocs(q);
    if (docs.empty) {
        return [];
    } else {
        return docs.docs;
    }
}

export const getCountOfCollection = async (collectionName: string) : Promise<number> => {
    const snapshot = await getCountFromServer(collection(db, collectionName));
    return snapshot.data().count;
}

export const updateDocument = async (collectionName: string, id: string, document: object) => {
    await setDoc(doc(db, collectionName, id), document);
}

export const genQuery = (collectionName:string, filter: Filter) : Query => {
    const constraints : QueryConstraint[] = [];
    if (filter.orderBy) {
        constraints.push(orderBy(filter.orderBy.fieldName, filter.orderBy.direct));
    }
    if (filter.limit) {
        constraints.push(limit(filter.limit))
    }
    if (filter.endBefore) {
        constraints.push(endBefore(filter.endBefore))
    }
    if (filter.startAfter) {
        constraints.push(startAfter(startAfter))
    }
    if (filter.orWhere) {
        const filterConstraint = filter.where ? filter.where?.map(w => where(w.fieldName, w.operator, w.value)): [];
        return query(collection(db, collectionName), and(...filterConstraint, or(...filter.orWhere.map(w => where(w.fieldName, w.operator, w.value)))))
    } 
    if (filter.where) {
        filter.where.map(w => constraints.push(where(w.fieldName, w.operator, w.value)))
    }
    return query(collection(db, collectionName), ...constraints);
    
}

export const saveProject = async (project: object) => {
    return await saveDocument("projects", project);
}

export const updateProject = async(id: string, project: object) => {
    await updateDocument("projects", id, project);
}

export const getProject = async (id: string) : Promise<DocumentData | null> => {
    return await getDocument("projects", id);
}

export const getProjectsCount = async () : Promise<number> => {
    return await getCountOfCollection("projects");
}

export const saveUser = async (user: object) : Promise<string> => {
    return await saveDocument("users", user);
}

export const getUserById = async (id: string) : Promise<DocumentData | null> => {
    return await getDocument("users", id);
}

export const getUserByAddress = async (address: string, signature: string) : Promise<DocumentData | null> => {
    const res = await getDocs(genQuery("users", {
        where: [{
            fieldName: "address",
            operator: "==",
            value: address
        }, {
            fieldName: "signature",
            operator: "==",
            value: signature
        }]
    }));
    if (res.empty)
        return null;
    return res.docs[0];
}

export const updateUser = async (id: string, user: object) => {
    await updateDocument("users", id, user);
}

export const findOrAddUser = async (address: string, signature: string) : Promise<User | null> => {
    const res = await getUserById(address);
    if (res) {
        return res.signature === signature ? {
            ...res,
            id: address
        } as User : null;
    } else {
        await setDoc(doc(db, "users", address), {
            address,
            signature
        })
        return {
            id: address,
            address,
            signature,
        }
    }
}