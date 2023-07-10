import { createConnection } from "typeorm";
import { user } from "src/entities/user";

import config from "src/config";

export default async() => {
  if (config.NODE_ENV !== "test") {
    const typeormConnection = await createConnection();
    return {
      typeormConnection,
      repositories: {
        userRepository: typeormConnection.getRepository(user),
      },
    };
  } else {
    return {
      typeormConnection: null,
      repositories: {
      },
    };
  }
};
