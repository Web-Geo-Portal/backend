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

// router.post('/add', async (req, res) => {
//   try {
//     let temp_password = req.body.password;
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     const newUser = await pool.query(
//       'INSERT INTO users (user_name,user_email,user_role,user_password, aoi , geom , orignating_unit , dob ,designation , mobile_no , user_registered) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *'
//       , [req.body.first_name, req.body.email,req.body.user_role, hashedPassword,req.body.aoi,req.body.geom,req.body.orignating_unit,req.body.dob,req.body.designation,req.body.mobile_no,false]);

//       res.send({
//         status: 1,message: "User added successfully", newUser , temp_password
//       });
//     // res.json(jwtTokens(newUser.rows[0]));
//   } catch (error) {
//     res.status(500).json({error: error.message});
//   }
// });

router.post('/add', async (req, res) => {
  try {
    let userName = req.body.first_name,
        userEmail = req.body.email,
        userRole = req.body.user_role, 
        areaofintrest = req.body.aoi,
        geometry = req.body.geom,
        originatingUnit = req.body.orignating_unit,
        dateOfBirth = req.body.dob,
        designation = req.body.designation,
        mobile_no = req.body.mobile_no,
        created_by = req.body.created_by

    let temp_password = req.body.password;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user_credential = await pool.query(
      'INSERT INTO user_credential (user_name,user_email,designation,mobile_no,orignating_unit,dob) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *'
      ,[userName,userEmail,designation,mobile_no,originatingUnit,dateOfBirth]);

    const user_login = await pool.query(
      'INSERT INTO user_login (user_email,user_password,user_role,aoi,geom,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *'
      ,[userEmail,hashedPassword,userRole,areaofintrest,geometry,created_by,new Date()]);  

      res.send({
        status: 1,message: "User added successfully" , temp_password
      });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// router.get('/get-alluser',authenticateToken,async(req,res) =>{
//   try{
//     const allUserList = await pool.query(
//       'SELECT a.user_name,a.user_email,a.designation,a.mobile_no,a.orignating_unit,a.dob,a.user_id,b.user_role,b.is_active from user_credential as a INNER JOIN user_login as b ON a.user_email = b.user_email;');
//     res.send({
//       status: 1,data: allUserList.rows  
//     });
//   }catch(error){
//     res.status(500).json({error: error.message});
//   }
// })

router.post('/get-alluser',authenticateToken,async(req,res) =>{
  try{
    let created_by = req.body.id;
    const allUserList = await pool.query(
      'SELECT a.user_name,a.user_email,a.designation,a.mobile_no,a.orignating_unit,a.dob,a.user_id,b.user_role,b.is_active from user_credential as a INNER JOIN user_login as b ON a.user_email = b.user_email AND b.created_by = $1',[created_by]);
    res.send({
      status: 1,data: allUserList.rows  
    });
  }catch(error){
    res.status(500).json({error: error.message});
  }
})

router.post('/delete-user',authenticateToken,async(req,res) =>{
  try{
   let id = req.body.user_id;
   let email = await pool.query('SELECT user_email FROM user_credential where user_id = $1;',[id]);
   let userdelete = email.rows[0].user_email
    const usercredential = await pool.query('DELETE FROM user_credential where user_email = $1;',[userdelete]);
    const userlogin = await pool.query('DELETE FROM user_login where user_email = $1;',[userdelete]);
    res.send({
      status: 1,message: "User deleted successfully"  
    });
  }catch(error){
    res.status(500).json({error: error.message});
  }
})

router.post('/change-status',authenticateToken,async(req,res) =>{
  try{
    let id = req.body.user_id;
    let email = await pool.query('SELECT user_email FROM user_credential where user_id = $1;',[id]);
    let email_id = email.rows[0].user_email
    const users = await pool.query('SELECT * FROM user_login WHERE user_email = $1', [email_id]);
    let status = !users.rows[0].is_active
    const updateStatus = await pool.query('UPDATE user_login set is_active = $2 WHERE user_email = $1', [email_id,status]); 
    res.send({
      status: 1,message: "User Status Changed"  
    });
  }catch(error){
    res.status(500).json({error: error.message});
  }
})


router.post('/register-user',authenticateToken, async(req,res) =>{
  try{
    let id = req.body.email;
    let oldPassword = req.body.oldpassword;

    const users = await pool.query('SELECT * FROM user_login WHERE user_email = $1', [id]);

    let validPassword = await bcrypt.compare(oldPassword, users.rows[0].user_password);
    if(validPassword){
      if(users.rows.length != 0 && users.rows[0].user_registered == false){
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const updatePassword = await pool.query('UPDATE user_login set user_password = $2 WHERE user_email = $1', [id,hashedPassword]);
        const userRegistered = await pool.query('UPDATE user_login set user_registered = $2 WHERE user_email = $1', [id,true]);
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