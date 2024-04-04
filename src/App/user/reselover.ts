import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTServices from "../../Services/jwt";

interface GoogleTokenResult {
  iss?: string;
  azp?: string;
  aud?: string;
  sub?: string;
  email: string;
  email_verified: string;
  nbf?: string;
  name?: string;
  picture?: string;
  given_name?: string; // Make this property optional
  family_name?: string; // Make this property optional
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
}

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const googleToken = token;
    const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
    googleOauthURL.searchParams.set("id_token", googleToken);

    const { data } = await axios.get<GoogleTokenResult>(
      googleOauthURL.toString(),
      {
        responseType: "json",
      }
    );

    const user = await prismaClient.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      await prismaClient.user.create({
        data: {
          email: data.email,
          firstname:data.given_name,
          lastname: data.family_name,
          profileImageURL: data.picture,
        },
      });
    }

    const userIndb=await prismaClient.user.findUnique({where:{email:data.email}});
    if(!userIndb) throw new Error('user withemail not found..');

    const userToken=await JWTServices.generateTokenForUser(userIndb);
    return userToken;
  },
};

export const resolvers = { queries };
