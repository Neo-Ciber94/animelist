import { config } from "dotenv";
config();

console.log(process.env.MY_ANIME_LIST_CLIENT_ID);

import { Auth } from "@animelist/auth/server";




console.log({ Auth });
