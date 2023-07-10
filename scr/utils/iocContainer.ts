import logger from "src/utils/logger";

const dependencies = {};

const init = () => {
  Object.getOwnPropertyNames(dependencies).forEach(function(prop) {
    delete dependencies[prop];
  });
};


const replace = (name, dependency) => {
  if (!dependencies[name]) {
    logger.warn(`Dependency ${name} not exists. Abort.`);
    throw new Error(`Dependency ${name} not exists. Abort.`);
  }
  dependencies[name] = dependency;
};


const inject = (name, dependency) => {
  if (dependencies[name]) {
    logger.warn(`Dependency ${name} already injected. Abort.`);
    throw new Error(`Dependency ${name} already injected. Abort.`);
  }
  dependencies[name] = dependency;
};

const get = (name) => {
  if (!dependencies[name]) {
    logger.warn(`Dependency ${name} not exists. Abort.`);
    throw new Error(`Dependency ${name} not exists. Abort.`);
  }
  return dependencies[name];
};

export default {
  inject,
  get,
  init,
  replace,
};
