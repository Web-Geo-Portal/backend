import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import { jwtTokens } from '../utils/jwt-helpers.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
;
    const { email, password } = req.body;
    let attempts = Number(req.body.attempts);
    const now  = new Date()
    // let emptyDate = null;
    //     await pool.query('UPDATE users set blocked_time = $2 WHERE user_email = $1', [email,emptyDate ]);
    //     return;

    const users = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);
    // check if user is blocked
   
    

    let userLoggedIn = await pool.query('SELECT * FROM users WHERE user_email = $1 AND is_loggedIn = true', [email]);
    
    if (users.rows.length === 0) 
    {
      return res.send({status: 0,  error: "Email is incorrect"});
    }

    if(users.rows[0].blocked_time){
      let temp = users.rows[0].blocked_time;
      let time_left = new Date(temp).getTime() - (now.getTime());
      if(time_left > 0 ){
        return res.send({
          status: 0,  error: "User blocked"
        });
      }else{
        let emptyDate = null;
        await pool.query('UPDATE users set blocked_time = $2 WHERE user_email = $1', [email,emptyDate ]);
      }
    }
    //PASSWORD CHECK
    let validPassword = await bcrypt.compare(password, users.rows[0].user_password);
    if (!validPassword){
      // block user after 3 attempts
      if(attempts+1 > 3){
        let blockedDate = new Date(now.getTime() + 86400000)
        await pool.query('UPDATE users set blocked_time = $2 WHERE user_email = $1', [email,blockedDate ]);
        return res.send({status: 0,  error: "User blocked"});
      }
      return res.send({
        status: 2,  error: "Password Incorrect"
    });
    } 
    if (userLoggedIn.rows.length > 0) {
     return res.status(401).json({status:0,error:"User already login!"});
    }
    
    //JWT
    let tokens = jwtTokens(users.rows[0]);//Gets access and refresh tokens
    res.cookie('refresh_token', tokens.refreshToken, {...(process.env.COOKIE_DOMAIN && {domain: process.env.COOKIE_DOMAIN}) , httpOnly: true,sameSite: 'none', secure: true});
    // res.json(tokens);
    let loggedIn = await pool.query('UPDATE users set is_loggedIn = true WHERE user_email = $1', [email]);
    res.send({
      status: 1, token: tokens,expiresIn:86400, message: "Login successfull",users
    });
  } catch (error) {
    res.status(401).json({error: error.message});
  }

});

router.get('/refresh_token', (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    console.log(req.cookies);
    if (refreshToken === null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
      if (error) return res.status(403).json({error:error.message});
      let tokens = jwtTokens(user);
      res.cookie('refresh_token', tokens.refreshToken, {...(process.env.COOKIE_DOMAIN && {domain: process.env.COOKIE_DOMAIN}) , httpOnly: true,sameSite: 'none', secure: true});
      return res.json(tokens);
    });
  } catch (error) {
    res.status(401).json({error: error.message});
  }
});

router.post('/refresh_token', async(req, res) => {
  try {
    let email = req.body.email;
    const loggedOut = await pool.query('UPDATE users set is_loggedIn = false WHERE user_email = $1', [email]);
    res.clearCookie('refresh_token');
    return res.status(200).json({status:1,message:'Refresh token deleted.'});
  } catch (error) {
    res.status(401).json({error: error.message});
  }
});

export default router;