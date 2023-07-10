import * as companyRepository from 'src/repositories/company';

const createCompany = async ({ company }) => {
  try {
    const newCompany = await companyRepository.createCompany(company);

    return {
      newCompany,
    };
  } catch (err) {
    throw err;
  }
};

const getCompany = async ({ idCompany }) => {
  return await companyRepository.findOneById({ idCompany });
};

export { createCompany, getCompany };
