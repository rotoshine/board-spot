'use strict';
import logger from '../utils/logger';
import {Strategy as FacebookStrategy} from 'passport-facebook';
import {Strategy as KakaoStrategy} from 'passport-kakao';
import {Strategy as TwitterStrategy} from'passport-twitter';

import mongoose from 'mongoose';
const User = mongoose.model('User');

function oauthConnect(provider, profile, done) {
  return User.findOne({
    provider: provider,
    providerId: profile.id
  }, (err, user) => {
    if (err) {
      return done(err, null);
    } else {
      if (!user) {
        const newUser = new User({
          name: profile.displayName,
          username: profile.username,
          role: 'user',
          provider: provider,
          providerId: profile.id,
          originData: profile._json
        });
        return newUser.save(() => {
          return done(null, newUser);
        });
      } else {
        user.name = profile.displayName;
        user.originData = profile._json;

        return user.save((err) => {
          return done(err, user);
        });
      }
    }
  });
}

const Providers = {
  facebook: {
    strategy: FacebookStrategy,
    scope: ['public_profile', 'user_about_me', 'user_location'],
    saveProfileImage: (accessToken, profile) => {
      return new Promise((resolve) => {

      });
    }
  },
  kakao: {
    strategy: KakaoStrategy,
    saveProfileImage: (accessToken, profile) => {

    }
  },
  twitter: {
    strategy: TwitterStrategy,
    saveProfileImage: (accessToken, profile) => {

    }
  }
};

module.exports = (app, passport, config) => {
  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    return User.findById(id, (err, user) => {
      return done(err, user);
    });
  });

  for(let providerName in config.auth){
    if(Providers.hasOwnProperty(providerName)){
      const authConfig = config.auth[providerName];
      const provider = Providers[providerName];

      passport.use(new provider.strategy(authConfig, (accessToken, refreshToken, profile, done) => {
        return oauthConnect(providerName, profile, done);
      }));


      let passportParams = {
        session: true
      };

      if(provider.scope){
        passportParams.scope = provider.scope;
      }
      app.get(`/auth/${providerName}/login`, passport.authenticate(providerName, passportParams));
      app.get(`/auth/${providerName}/login/callback`, passport.authenticate(providerName, {
        session: true,
        successRedirect: '/'
      }));

      logger.info(`[AUTH] ${providerName} enable.`);
    }
  }

  app.get('/api/me', passport.authenticate('facebook', {session: true}), (req, res) => {
    res.json(req.user);
  });
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
};
