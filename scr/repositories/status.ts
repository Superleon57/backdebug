import ioc from "src/utils/iocContainer";

export const getDbStatus = async() => {
    return await ioc.get("typeormConnection").query(`
  SELECT VERSION()
  `);
};