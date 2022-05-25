import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import { jwtTokens } from '../utils/jwt-helpers.js';

const router = express.Router();

router.get('/get-aoi',async(req,res) =>{
    try{
      const data = await pool.query('SELECT * from final_cams1;');
      res.send({status: 1,data: data.rows});
    }catch(error){
      res.status(500).json({error: error.message});
    }
})

export default router;