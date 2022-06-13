import express from 'express';
import pool from '../db.js';
import { jwtTokens } from '../utils/jwt-helpers.js';
import * as path from 'path';
import pkg from 'multer';
const { multer } = pkg;

//for background images
var storage = pkg.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '../login2/src/assets/background/');
},
// By default, multer removes file extensions so let's add them back
filename: function(req, file, cb) {
  console.log(file)
    cb(null, file.originalname.split('.')[0] + '-' + Date.now() + path.extname(file.originalname));
}
})
var upload = pkg({ storage: storage })
const router = express.Router();

//for logo images
var storagelogo = pkg.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '../login2/src/assets/logo/');
},
// By default, multer removes file extensions so let's add them back
filename: function(req, file, cb) {
    cb(null, file.originalname.split('.')[0] + '-' + Date.now() + path.extname(file.originalname));
}
})
var uploadlogo = pkg({ storage: storagelogo })



router.post('/get-aoi',async(req,res) =>{
    try{
      let userRole = req.body.role;
      const data = await pool.query('SELECT * from aoi_final_cams WHERE role = $1',[userRole]);
      res.send({status: 1,data: data.rows});
    }catch(error){
      res.status(500).json({error: error.message});
    }
})

router.post('/upload', upload.single('file') , async(req,res) =>{
  try{
    if(req.file){
      const now  = new Date()
      let updated_date = new Date(now.getTime())
      const background_image = await pool.query(
        'INSERT INTO home_settings (background_image,image_type,updated_at) VALUES ($1,$2,$3) RETURNING *'
        , [req.file.filename, 'Background',updated_date]);
      return res.send({status:1,message:'Image upload successfully'});
    }
  }catch(error){
    res.status(500).json({error: error.message});
  }    
})
router.post('/logo', uploadlogo.single('logo') , async(req,res) =>{
  try{
    if(req.file){
      const now  = new Date()
      let updated_date = new Date(now.getTime())
      const logo_image = await pool.query(
        'INSERT INTO home_settings (background_image,image_type,updated_at) VALUES ($1,$2,$3) RETURNING *'
        , [req.file.filename, 'Logo',updated_date]);
      return res.send({status:1,message:'Logo upload successfully'});
    }
  }catch(error){
    res.status(500).json({error: error.message});
  }    
})


router.get('/get-images',async(req,res)=>{
  try{
    let data = {};
    data['logo'] = await pool.query('SELECT * FROM home_settings WHERE image_type = $1 ORDER BY updated_at DESC LIMIT 1' ,["Logo"]);
    data['background'] = await pool.query('SELECT * FROM home_settings WHERE image_type = $1 ORDER BY updated_at DESC LIMIT 1' ,["Background"]);
      res.send({status: 1,data: data});
  }catch(error){
    res.status(500).json({error: error.message});
  }
})

export default router;