"use client";
import {useEffect} from "react";
declare global{interface Window{fbq?:(...args:unknown[])=>void;gtag?:(...args:unknown[])=>void}}
export function LeadConversion(){useEffect(()=>{window.fbq?.("track","Lead");window.gtag?.("event","generate_lead")},[]);return null}