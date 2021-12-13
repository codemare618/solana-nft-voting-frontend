import axios from 'axios';

export const getMetadata = async (url) => {
    return new Promise(( async (resolve, reject) => {
        try {
            const result = await axios.get(url)
            // console.log('res--', result);
            resolve(result)
        } catch (e) {
            reject(e)
        }
    }))

}