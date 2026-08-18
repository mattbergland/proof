import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "proof-development-secret");
export async function setSession(userId:string) { const token = await new SignJWT({userId}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("30d").sign(secret); (await cookies()).set("proof_session",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:2592000,path:"/"}); }
export async function currentUser() { const token=(await cookies()).get("proof_session")?.value; if(!token)return null; try { const {payload}=await jwtVerify(token,secret); return db.user.findUnique({where:{id:String(payload.userId)},include:{workspace:true}}); } catch{return null;} }
