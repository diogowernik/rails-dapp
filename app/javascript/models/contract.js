import { ethers } from "ethers";
import abi from "../contract.json";

let CONTRACT_ABI = abi.abi;

async function createContract(provider) {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider.getSigner());
}

export { createContract };