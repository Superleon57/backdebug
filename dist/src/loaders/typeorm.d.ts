import { User } from "src/entities/user";
declare const _default: () => Promise<{
    typeormConnection: import("typeorm").DataSource;
    repositories: {
        userRepository: import("typeorm").Repository<User>;
    };
} | {
    typeormConnection: null;
    repositories: {
        userRepository?: undefined;
    };
}>;
export default _default;
