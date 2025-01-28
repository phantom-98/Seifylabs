import { BrowserProvider, encodeBase58 } from 'ethers';

export const formatWalletAddress = (address: string | undefined, length : number = 4) => {
    if (!address) return null;
    const prefix = address.startsWith('0x') ? 2 : 0;
    return address.substring(0, length + prefix) + "..." + address.substring(address.length - length);
}

export const getSolanaProvider = () => {
    if ('phantom' in window) {
        const provider = (window as any).phantom?.solana;
    
        if (provider?.isPhantom) {
            return provider;
        }
    }
    return null;
}

export const getEthereumProviderForPhantom = () => {
    if ('phantom' in window) {
        const provider = (window as any).phantom?.ethereum;

        if (provider?.isPhantom) {
            return provider;
        }
    }
    return null;
}

export const getEthereumProviderForMetaMask = () => {
    if ('ethereum' in window) {
        const provider = (window as any).ethereum;
        if (provider?.isMetaMask) {
            return provider;
        }
    }
    return null;
}

export const getEthereumAccounts = async () => {
    const provider = getEthereumProviderForPhantom() || getEthereumProviderForMetaMask();
    try {
        const accounts = await provider.request({method: 'eth_requestAccounts'});
        console.log("phantom accounts", accounts);
        return accounts;
    } catch (e) {
        console.log("User rejected the request!")
        return null;
    }
}

export const connectEthereum = async () => {
    const provider = new BrowserProvider(getEthereumProviderForPhantom() || getEthereumProviderForMetaMask());
    try {
        const signer = await provider.getSigner();
        const signature = await signer.signMessage("To avoid digital dognappers, sign below to authenticate with CryptoCorgis")
        return {
            address: signer.address,
            signature
        }
    } catch (e) {
        console.log("User rejected the request!", e)
        return null;
    }
}

export const connectSolana = async () => {
    const provider = getSolanaProvider();
    try {
        const msg = `To avoid digital dognappers, sign below to authenticate with CryptoCorgis`;
        const enc = new TextEncoder().encode(msg);
        const { signature, publicKey } = await provider.signMessage( enc );
        return {
            address: publicKey.toBase58(),
            signature: encodeBase58(signature)
        }
    } catch (e) {
        console.log("User rejected the request!", e)
        return null;
    }
}