/* eslint-disable no-unused-vars */
/* eslint-disable no-script-url */
/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import styled from "styled-components";
import { getMetadata } from "../service/metadata";
import { Button, Grid, useToast } from "@chakra-ui/react";
import { createVoter, updateVoter } from "../service/firestore";

const NFTItem = ({
  data,
  voters,
  publicKey,
  mint,
  getInitVoters,
  ...props
}) => {
  const [vote, setVote] = React.useState(null);
  const [metaData, setMetaData] = React.useState({});
  const [keeps, setKeeps] = React.useState(0);
  const [burns, setBurns] = React.useState(0);
  const [isKeeping, setKeeping] = React.useState(false);
  const [isBurning, setBurning] = React.useState(false);
  const [imgExist, setImgExist] = React.useState(false);
  const toast = useToast();
  React.useEffect(() => {
    getData(data);
    data && checkImg(data.uri);
  }, [data]);
  React.useEffect(() => {
    setVote({
      ...voters.find((v) => v.publicKey === publicKey && v.mint === mint),
    });
    setKeeps(voters.filter((v) => v.mint === mint && v.vote === 1)?.length);
    setBurns(voters.filter((v) => v.mint === mint && v.vote === 0)?.length);
  }, [voters]);

  const getData = React.useCallback(async (data) => {
    if (data.uri) {
      const result = await getMetadata(data.uri);
      setMetaData(result.data);
    }
    // const vote1 = voters.find(v => v.publicKey === publicKey && v.mint === mint);
  }, []);
  const onKeep = async () => {
    setKeeping(true);
    Object.keys(vote).length && (await updateVoter(vote.id, 1));
    Object.keys(vote).length || (await createVoter(publicKey, mint, 1));
    getInitVoters();
    setKeeping(false);
    toast({
      title: "Vote Registered",
      description: `You voted(keep) to the token ${metaData?.name}`,
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top-right",
    });
  };
  const onBurn = async () => {
    setBurning(true);
    Object.keys(vote).length && (await updateVoter(vote.id, 0));
    Object.keys(vote).length || (await createVoter(publicKey, mint, 0));
    getInitVoters();
    setBurning(false);
    toast({
      title: "Vote Registered",
      description: `You voted(burn) to the token ${metaData?.name}`,
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top-right",
    });
  };
  const checkImg = (url) => {
    console.log("url-----", url);
    fetch(new Request(url, { method: "HEAD", mode: "no-cors" }))
      .then(function () {
        console.log("exist");
        setImgExist(true);
      })
      .catch(function () {
        console.log("not eixt");
        setImgExist(false);
      });
  };
  return (
    <Container pos="relative" style={{ position: "relative" }}>
      {imgExist && (
        <NFTImg
          src={metaData?.image}
          alt={`No Assets for ${metaData?.name}`}
          onload="javascript: alert('success')"
          onerror="javascript: alert('failure')"
        />
      )}
      <Title>{metaData?.name}</Title>

      <Grid
        templateColumns="repeat(2, 1fr)"
        gap={6}
        style={{ position: "absolute", bottom: 30 }}
        w={"90%"}
        marginLeft={"5%"}
      >
        <Button
          colorScheme="blue"
          variant="outline"
          isDisabled={vote && vote.vote === 1}
          onClick={() => onKeep()}
          isLoading={isKeeping}
          loadingText={`Keeping(${keeps})`}
          spinnerPlacement="end"
        >
          Keep({keeps})
        </Button>
        <Button
          colorScheme="blue"
          variant="outline"
          isDisabled={vote && vote.vote === 0}
          onClick={() => onBurn()}
          isLoading={isBurning}
          loadingText={`Burning(${burns})`}
          spinnerPlacement="end"
        >
          Burn({burns})
        </Button>
      </Grid>
    </Container>
  );
};

const Container = styled.div`
  background-color: #161519;
  padding-bottom: 20px;
  border-radius: 30px;
  min-height: 500px;
  width:300px;
  margin: auto;
  &:hover {
    background-color: #7111b6;
    cursor: pointer;
  }
`;
const Title = styled.h1`
  color: white;
  margin-top: 20px;
`;
const Description = styled.p`
  color: #aca1b0;
  width: 70%;
  margin: auto;
`;
// const Date = styled.h4`
//   color: #aca1b0;
// `;
const NFTImg = styled.img`
  width: 100%;
  height: 300px;
  border-radius: 30px;
`;

export default NFTItem;
