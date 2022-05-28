import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import { jwtTokens } from '../utils/jwt-helpers.js';
import { dirname,join } from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

router.get('/get-aoi',async(req,res) =>{
    try{
      const data = await pool.query('SELECT * from final_cams1;');
      res.send({status: 1,data: data.rows});
    }catch(error){
      res.status(500).json({error: error.message});
    }
})

// router.get('/image',async(req,res) =>{
//     try{
//         // console.log(__dirname);
//         // express.static(join(__dirname, 'public'))
//         res.sendFile(express.static(join(__dirname, '/images/test.png')));
//     }catch(error){
//         res.status(500).json({error: error.message});
//     }
// })

router.post('/upload',async(req,res) =>{
    console.log(req.body,'sadsa')
    return res.send({status:1});
})

export default router;