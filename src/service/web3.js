import {deserializeUnchecked} from 'borsh'
const {PublicKey, Connection} = require('@solana/web3.js');

const ProgramIDS = {
    SPL_TOKEN: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    METADATA: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
}

class Data {
    constructor({
        name,
        symbol,
        uri,
        sellerFeeBasisPoints,
        creators
    }) {
        this.name = name;
        this.symbol = symbol;
        this.uri = uri;
        this.sellerFeeBasisPoints = sellerFeeBasisPoints;
        this.creators = creators;
    }
}

class Creator {
    constructor({ address, verified, share}) {
        this.address = address;
        this.verified = verified;
        this.share = share;
    }
}

class Metadata {
    constructor({updateAuthority, mint, data,primarySaleHappened, isMutable, masterEdition}) {
        this.key = 4;
        this.updateAuthority = updateAuthority;
        this.mint = mint;
        this.data = data;
        this.primarySaleHappened = primarySaleHappened;
        this.isMutable = isMutable;
    }
}

const METADATA_SCHEMA = new Map([
    [
        Data,
        {
            kind: "struct",
            fields: [
                ["name", "string"],
                ["symbol", "string"],
                ["uri", "string"],
                ["sellerFeeBasisPoints", "u16"],
                ["creators", { kind: "option", type: [Creator] }],
            ],
        },
    ],
    [
        Creator,
        {
            kind: "struct",
            fields: [
                ["address", [32]],
                ["verified", "u8"],
                ["share", "u8"],
            ],
        },
    ],
    [
        Metadata,
        {
            kind: "struct",
            fields: [
                ["key", "u8"],
                ["updateAuthority", [32]],
                ["mint", [32]],
                ["data", Data],
                ["primarySaleHappened", "u8"],
                ["isMutable", "u8"],
            ],
        },
    ],
]);

/**
 *
 * @param owner : PublicKey
 * @param connection : Connection
 * @returns {Promise<void>}
 */
export async function getNFTTokens(owner, connection) {
    const result = await connection.getParsedTokenAccountsByOwner(owner, {programId: new PublicKey(ProgramIDS.SPL_TOKEN)});
    console.log('length----', result)
    const ret = [];
    if (result && result.value && result.value.length) {
        for (let i = 0; i < result.value.length; i++) {
            const data = result.value[i].account.data;
            const {info: {mint, tokenAmount}} = data.parsed;
            if (tokenAmount.uiAmount <= 1) {
                // mint should be the NFT token
                try {
                    const metadata = await getMetadata(connection, mint);
                    const {
                        data,
                        data: {uri}
                    } = metadata;
                    if (uri) {
                        ret.push({...data, token: mint});
                    }
                }catch(exception){}
            }
        }
    }
    return ret;
    // const sample = await getMetadata(new Connection('https://api.devnet.solana.com','confirmed'), '7m9gHwaYRd5BGmDedSM7pvEAfakqYbUnuNBhNVgreVB9')
    // return [sample];
}


/**
 * @param connection : Connection
 * @param mint : string
 * @returns {Promise<void>}
 */
async function getMetadata(connection, mint) {
    const addresses = await PublicKey.findProgramAddress([
        Buffer.from('metadata'),
        new PublicKey(ProgramIDS.METADATA).toBuffer(),
        new PublicKey(mint).toBuffer(),
    ], new PublicKey(ProgramIDS.METADATA));
    if (addresses.length > 0) {
        const key = addresses[0];
        const accountInfo = await connection.getAccountInfo(key);
        const binaryData = accountInfo.data;

        // parse binary data
        const metadata = deserializeUnchecked(
            METADATA_SCHEMA,
            Metadata,
            binaryData
        );
        // console.log('metadata----', metadata)

        metadata.data.name = metadata.data.name.replace(/\0/g, "");
        metadata.data.symbol = metadata.data.symbol.replace(/\0/g, "");
        metadata.data.uri = metadata.data.uri.replace(/\0/g, "");
        // console.log('metadata----', metadata)
        return metadata;
    }
}

export const getNFTByAddress = (address) => {
    getMetadata(new Connection(process.env.REACT_APP_RPC_URL, 'confirmed'), address)
}

// getMetadata(new Connection('https://api.devnet.solana.com','confirmed'), '7m9gHwaYRd5BGmDedSM7pvEAfakqYbUnuNBhNVgreVB9').then(result => {
//     console.log(result);
// }).catch(error => {
//     console.log(error);
// });
