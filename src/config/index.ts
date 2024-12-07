export const config = {
  kiltNode: process.env.KILT_NODE_URL || 'wss://spiritnet.kilt.io',
  plcResolver: process.env.PLC_RESOLVER || 'https://plc.directory',
  port: process.env.PORT || 3000
};
