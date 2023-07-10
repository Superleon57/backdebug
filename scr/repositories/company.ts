import ioc from 'src/utils/iocContainer';
import { Company } from 'src/entities/company';

export const findOneById = async ({ idCompany }) => await ioc.get('companyRepository').findOne({ id: idCompany });

export const createCompany = async newCompany => {
  const entityManager = ioc.get('companyRepository');
  return await entityManager.create(newCompany);
};
