/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable no-unused-vars */
import React from "react";
import { getNFTTokens } from "../service/web3";
import NFTItem from "../components/NFTItem";
import styled from "styled-components";
import { Button, Stack, Grid, Box } from "@chakra-ui/react";
import { getVoters } from "../service/firestore";
import { extendTheme } from "@chakra-ui/react";
import { createBreakpoints } from "@chakra-ui/theme-tools";
const web3 = require("@solana/web3.js");
const { PublicKey } = require("@solana/web3.js");

const breakpoints = createBreakpoints({
  sm: "320px",
  md: "900px",
  lg: "960px",
  xl: "1200px",
  "2xl": "1600px",
});

const theme = extendTheme({ breakpoints });

const Home = () => {
  const [phantom, setPhantom] = React.useState(null);
  const [connected, setConnected] = React.useState(false);
  const [publicKey, setPublickKey] = React.useState(null);
  const [connection, setConnection] = React.useState(null);
  const [data, setData] = React.useState([]);
  const [isLoading, setLoading] = React.useState(false);
  const [voters, setVoters] = React.useState([]);

  React.useEffect(() => {
    setTimeout(() => {
      if (window.hasOwnProperty("solana")) {
        setPhantom(window["solana"]);
      }
    }, 100);
    getInitVoters();
  }, []);
  React.useEffect(() => {
    phantom?.on("connect", (res) => {
      setConnected(true);
      console.log("res--", res.toString());
      setPublickKey(res);
      getConnection();
    });

    phantom?.on("disconnect", () => {
      console.log("disconnect");
      setConnected(false);
      setPublickKey(null);
      setConnection(null);
    });
  }, [phantom]);

  const getInitVoters = async () => {
    const result = await getVoters();
    console.log("result---", result);
    setVoters([...result]);
  };

  const getInitNFTs = async () => {
    setLoading(true);
    const results = await getNFTTokens(
      new PublicKey(process.env.REACT_APP_WALLET_ADDRESS),
      connection
    );
    setData(results);
    setLoading(false);
  };

  const getConnection = () => {
    setConnection(
      new web3.Connection(process.env.REACT_APP_RPC_URL, "confirmed")
    );
  };

  const connectPhantom = React.useCallback(() => {
    phantom.connect();
  }, [phantom]);

  const disconnectHandler = React.useCallback(() => {
    phantom?.disconnect();
  }, [phantom]);

  const getBalance = React.useCallback(async () => {
    if (!connection) return;
    let stakeBalance = await connection.getBalance(publicKey);
    console.log("balance--", stakeBalance);
  }, [connection, publicKey]);

  const getTokens = React.useCallback(async () => {
    console.log(!connection || !publicKey);
    if (!connection || !publicKey) return;
    setLoading(true);
    const result = await getNFTTokens(publicKey, connection);
    console.log(result);
    setData(result);
    setLoading(false);
  }, [connection, publicKey]);

  const RenderData = React.useCallback(() => {
    return (
      <div>
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            xl: "repeat(3, 1fr)",
            "2xl": "repeat(4, 1fr)",
          }}
          gap={6}
        >
          {data.map((item) => {
            // console.log('item---', item.token, publicKey.toString())
            if (item && item.uri) {
              const vote = voters.find(
                (v) =>
                  v.publicKey === publicKey.toString() && v.mint === item.token
              );
              return (
                <Box
                  sm={{ base: 3, lg: 6 }}
                  key={item?.uri}
                  style={{ marginTop: 30 }}
                >
                  <NFTItem
                    data={item}
                    vote={vote}
                    voters={[...voters]}
                    publicKey={publicKey.toString()}
                    mint={item.token}
                    getInitVoters={getInitVoters}
                  />
                </Box>
              );
            }
            if (item && item.data.uri) {
              const vote = voters.find(
                (v) =>
                  v.publicKey === publicKey.toString() &&
                  v.mint === item.data.token
              );
              return (
                <Box
                  align="center"
                  sm={3}
                  key={item?.data?.uri}
                  style={{ marginTop: 30 }}
                >
                  <NFTItem
                    data={item.data}
                    vote={vote}
                    voters={[...voters]}
                    publicKey={publicKey.toString()}
                    mint={item.token}
                    getInitVoters={getInitVoters}
                  />
                </Box>
              );
            }
            return <div key={item?.token} />;
          })}
        </Grid>
      </div>
    );
  }, [data, voters]);
  return (
    <ContainerView align="center">
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={4}
        align="center"
        justify={"center"}
      >
        {phantom && !connected && (
          <Button onClick={connectPhantom}>Connect Phantom</Button>
        )}
        {phantom && connected && (
          <Button onClick={disconnectHandler}>Disconnect Your wallet!</Button>
        )}
        {!phantom && (
          <a
            href="https://phantom.app/"
            target="_blank"
            className="bg-purple-500 px-4 py-2 border border-transparent rounded-md text-base font-medium text-white"
          >
            <Button colorScheme="teal" variant="solid">
              Get Phantom
            </Button>
          </a>
        )}
        {phantom && connected && (
          <Button
            onClick={getInitNFTs}
            isLoading={isLoading}
            loadingText="Getting shrimp"
            spinnerPlacement="end"
          >
            Load up the shrimp fund!
          </Button>
        )}
        {/*{(phantom && connected) && <Button colorScheme="teal" variant="outline" onClick={getTokens}>*/}
        {/*    Get NFTs*/}
        {/*</Button>}*/}
      </Stack>
      {RenderData()}
    </ContainerView>
  );
};
const ContainerView = styled.div`
  padding-top: 100px;
  padding-left: 10%;
  padding-right: 10%;
  flex: 1;
  align-items: center;
  text-align: center;
`;

export default Home;
