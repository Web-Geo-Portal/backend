import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import {authenticateToken} from '../middleware/authorization.js';
import { jwtTokens } from '../utils/jwt-helpers.js';

let refreshTokens = [];

const router = express.Router();

/* GET users listing. */
router.get('/',authenticateToken, async (req, res) => {
  try {
    console.log(req.cookies);
    const users = await pool.query('SELECT * FROM users');
    res.json({users : users.rows});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.post('/', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (user_name,user_email,user_password) VALUES ($1,$2,$3) RETURNING *'
      , [req.body.name, req.body.email, hashedPassword]);
    res.json(jwtTokens(newUser.rows[0]));
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.post('/add', async (req, res) => {
  try {
    console.log(req.body)
    let temp_password = req.body.password;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (first_name,last_name,user_email,user_role,user_password,user_name,aoi,geom,user_registered) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *'
      , [req.body.first_name, req.body.last_name, req.body.email,req.body.user_role, hashedPassword,'',req.body.aoi,req.body.geom,false]);
      // console.log(newUser);
      res.send({
        status: 1,message: "User added successfully", newUser , temp_password
      });
    // res.json(jwtTokens(newUser.rows[0]));
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.get('/get-alluser',async(req,res) =>{
  try{
    const allUserList = await pool.query('SELECT * from users;');
    res.send({
      status: 1,data: allUserList.rows  
    });
  }catch(error){
    res.status(500).json({error: error.message});
  }
})

router.post('/delete-user',async(req,res) =>{
  try{
   let id = req.body.user_id;
    const users = await pool.query('DELETE FROM users where user_id = $1;',[id]);
    res.send({
      status: 1,message: "User deleted successfully"  
    });
  }catch(error){
    res.status(500).json({error: error.message});
  }
})

router.post('/change-status',async(req,res) =>{
  try{
    let id = req.body.user_id;
    const users = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    let status = !users.rows[0].is_active
    const updateStatus = await pool.query('UPDATE users set is_active = $2 WHERE user_id = $1', [id,status]); 
    res.send({
      status: 1,message: "User Status Changed"  
    });
  }catch(error){
    res.status(500).json({error: error.message});
  }
})


router.post('/register-user',async(req,res) =>{
  try{
    let id = req.body.email;
    let oldPassword = req.body.oldpassword;

    const users = await pool.query('SELECT * FROM users WHERE user_email = $1', [id]);

    let validPassword = await bcrypt.compare(oldPassword, users.rows[0].user_password);
    if(validPassword){
      if(users.rows.length != 0 && users.rows[0].user_registered == false){
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const updatePassword = await pool.query('UPDATE users set user_password = $2 WHERE user_email = $1', [id,hashedPassword]);
        const userRegistered = await pool.query('UPDATE users set user_registered = $2 WHERE user_email = $1', [id,true]);
        res.send({
          status: 1,message: "User Password Changed"  
        });
      }else{
        res.send({
          status: 0,error: "User not found"  
        });
      }
    }else{
      res.send({
        status: 0,error: "Old password incorrect"  
      });
    }

    
  }catch(error){
    res.status(500).json({error: error.message});
  }
})

router.delete('/', async (req,res)=>{
  try {
    const users = await pool.query('DELETE FROM users');
    res.status(204).json(users.rows);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
})


export default router;