import express from "express";
import ioc from "src/utils/iocContainer";

export default async() => {
  const app = ioc.get("express");
  app.use("/api/v1/wiki", express.static("_src"));
};
