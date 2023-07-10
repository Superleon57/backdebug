import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import config from "src/config";


export default (app) => {
  /*app.use(passport.initialize());

  passport.use(new FacebookStrategy({
    clientID: config.FACEBOOK_CLIENT_ID,
    clientSecret: config.FACEBOOK_CLIENT_SECRET,
    callbackURL: `${config.BASE_URL}/api/v1/auth/facebook/callback`,
    scope: "email",
    profileFields: ["email", "name"],
  },
  async function(accessToken, refreshToken, profile, done) {
    const user = {
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      sso: true,
    };

    done(null, user);
  },
  ));

  passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: `${config.BASE_URL}/api/v1/auth/google/callback`,
    scope: ["email", "profile"],
  },
  async function(token, tokenSecret, profile, done) {
    const user = {
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      sso: true,
    };
    done(null, user);
  },
  ));*/
};
