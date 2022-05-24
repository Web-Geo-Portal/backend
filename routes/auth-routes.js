import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import { jwtTokens } from '../utils/jwt-helpers.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {

    // console.log(req.cookies, req.get('origin'));
    const { email, password } = req.body;
    var count = 0;
    const users = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);
    let userLoggedIn = await pool.query('SELECT * FROM users WHERE user_email = $1 AND is_loggedIn = true', [email]);
    console.log(users.rows[0].attempts)
    if (users.rows.length === 0) 
    {
      return res.send({status: 0,  error: "Email is incorrect"});
    }
    //PASSWORD CHECK
    let validPassword = await bcrypt.compare(password, users.rows[0].user_password);
    if (!validPassword){
      // if(users.rows[0].attempts == 0){
      //   const now = new Date()
      //   const expdate =  new Date(now.getTime() + 300*1000);
      //   var expiresIn = expdate.getTime() - now.getTime()
        
      // } 
      // let count = users.rows[0].attempts + 1;
      // await pool.query('UPDATE users set attempts = $2 WHERE user_email = $1', [email,count]);
      
      // console.log(expiresIn);
      
      // if(expiresIn > 0 ){
      //   count ++;
      // }
      // console.log(count)
      return res.send({
        status: 0,  error: "Password Incorrect"
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