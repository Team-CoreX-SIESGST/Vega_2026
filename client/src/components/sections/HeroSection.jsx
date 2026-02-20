"use client";
import { motion } from "framer-motion";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import { ArrowForward, AutoAwesome } from "@mui/icons-material";
import UnicornBackground from "./UnicornBackground";

const HeroSection = () => {


  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <UnicornBackground />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 10,
          px: { xs: 3, sm: 6 },
          py: { xs: 10, sm: 20 },
        }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          sx={{ textAlign: "center", maxWidth: "1200px", mx: "auto" }}
        >
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            sx={{ display: "inline-flex", mb: 4 }}
          >
            <Chip
              icon={<AutoAwesome sx={{ fontSize: 16, color: "#603FEF" }} />}
              label="Next-Gen Analytics Platform"
              sx={{
                backgroundColor: "rgba(96, 63, 239, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(96, 63, 239, 0.2)",
                color: "rgba(255, 255, 255, 0.7)",
                px: 2,
                py: 1,
                "& .MuiChip-label": {
                  fontSize: "0.875rem",
                },
              }}
            />
          </Box>

          <Typography
            component={motion.h1}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            variant="h1"
            sx={{
              fontSize: {
                xs: "2.5rem",
                sm: "3.5rem",
                md: "4.5rem",
                lg: "5rem",
              },
              fontWeight: 700,
              mb: 3,
              lineHeight: 1.2,
              color: "#ffffff",
            }}
          >
            Actionable Intelligence for{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #603FEF 0%, #7D5FF3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Smarter Decisions
            </Box>
          </Typography>

          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            variant="h5"
            sx={{
              fontSize: { xs: "1.125rem", md: "1.5rem" },
              color: "rgba(255, 255, 255, 0.7)",
              mb: 6,
              maxWidth: "900px",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Transform raw data into powerful insights. Our AI-driven platform
            helps you understand trends, predict outcomes, and accelerate growth
            like never before.
          </Typography>

          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              
              sx={{
                background: "linear-gradient(135deg, #603FEF 0%, #7D5FF3 100%)",
                color: "#ffffff",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 0 20px rgba(96, 63, 239, 0.5)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4A2FBD 0%, #603FEF 100%)",
                  boxShadow: "0 0 30px rgba(96, 63, 239, 0.7)",
                  transform: "translateY(-2px)",
                },
                "& .MuiButton-endIcon": {
                  transition: "transform 0.3s ease",
                },
                "&:hover .MuiButton-endIcon": {
                  transform: "translateX(4px)",
                },
              }}
            >
              Get Started Free
            </Button>

            <Button
              variant="outlined"
              size="large"
              sx={{
                color: "#ffffff",
                borderColor: "rgba(96, 63, 239, 0.5)",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                backdropFilter: "blur(10px)",
                backgroundColor: "rgba(96, 63, 239, 0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#603FEF",
                  backgroundColor: "rgba(96, 63, 239, 0.2)",
                  boxShadow: "0 0 20px rgba(96, 63, 239, 0.3)",
                },
              }}
            >
              View Live Demo
            </Button>
          </Box>

          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            sx={{
              mt: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#4ade80",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                  },
                }}
              />
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                Real-time Data
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#603FEF",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                  },
                }}
              />
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                AI-Powered
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#3b82f6",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                  },
                }}
              />
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                Enterprise Ready
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "128px",
          background: "linear-gradient(to top, #000000, transparent)",
        }}
      />
    </Box>
  );
};

export default HeroSection;
