import * as statusRepository from "src/repositories/status";

export const getStatus = async() => {
    let dbHealth: any;
    try {
        dbHealth = await statusRepository.getDbStatus();
    } catch(err) {
        throw err;
    }
    
    return { dbHealth };
  };
