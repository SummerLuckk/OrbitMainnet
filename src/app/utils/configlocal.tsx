import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
 
export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  transport: http()
})