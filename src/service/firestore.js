import {db} from '../firebase-config';
import {addDoc, collection, deleteDoc, doc, getDocs, updateDoc} from 'firebase/firestore'
const usersCollectionRef = collection(db, "voters");

export const getVoters = async () => {
    const data = await getDocs(usersCollectionRef);
    return(data.docs.map(doc => ({...doc.data(), id: doc.id})))
}

export const createVoter = async (publicKey, mint, vote) => {
    return await addDoc(usersCollectionRef, {publicKey, mint, vote});
}

export const updateVoter = async (id, vote) => {
    const voterDoc = doc(db, "voters", id);
    const newFields = {vote}
    return await updateDoc(voterDoc, newFields)
}

export const deleteVoter = async (id) => {
    const voterDoc = doc(db, "voters", id);
    return await deleteDoc(voterDoc)
}