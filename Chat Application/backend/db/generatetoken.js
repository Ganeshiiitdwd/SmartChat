import jwt from 'jsonwebtoken'

const generatetoken=(id)=>{
     return jwt.sign({id},process.env.jwt_scecret,{
        expiresIn:'30d'
     })
}

export default generatetoken;