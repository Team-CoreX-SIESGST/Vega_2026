import { motion } from 'framer-motion';
import { Box, Container, Typography, Button, Chip } from '@mui/material';
import { ArrowForward, AutoAwesome } from '@mui/icons-material';

const CTASection = () => {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        py: { xs: 12, md: 16 },
        overflow: 'hidden',
      }}
    >
      {/* Background Effects */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(96, 63, 239, 0.1), rgba(96, 63, 239, 0.05), rgba(96, 63, 239, 0.1))',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            backgroundColor: 'rgba(96, 63, 239, 0.2)',
            borderRadius: '50%',
            filter: 'blur(150px)',
          }}
        />
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, px: { xs: 3, sm: 6 } }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{
            backgroundColor: 'rgba(10, 10, 10, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(96, 63, 239, 0.3)',
            borderRadius: 3,
            p: { xs: 6, md: 8 },
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(96, 63, 239, 0.3)',
          }}
        >
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            sx={{ display: 'inline-flex', mb: 4 }}
          >
            <Chip
              icon={<AutoAwesome sx={{ fontSize: 16, color: '#603FEF' }} />}
              label="Start Your Free Trial"
              sx={{
                backgroundColor: 'rgba(96, 63, 239, 0.1)',
                color: '#603FEF',
                px: 2,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
                border: '1px solid rgba(96, 63, 239, 0.2)',
              }}
            />
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.875rem', sm: '2.25rem', md: '3rem' },
              fontWeight: 700,
              mb: 3,
              color: '#ffffff',
              lineHeight: 1.2,
            }}
          >
            Ready to Transform Your{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #603FEF 0%, #7D5FF3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Data Strategy?
            </Box>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.125rem', md: '1.25rem' },
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 5,
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Join thousands of companies making smarter decisions with our AI-powered analytics platform.
            No credit card required.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                background: 'linear-gradient(135deg, #603FEF 0%, #7D5FF3 100%)',
                color: '#ffffff',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 0 20px rgba(96, 63, 239, 0.5)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4A2FBD 0%, #603FEF 100%)',
                  boxShadow: '0 0 30px rgba(96, 63, 239, 0.7)',
                  transform: 'translateY(-2px)',
                },
                '& .MuiButton-endIcon': {
                  transition: 'transform 0.3s ease',
                },
                '&:hover .MuiButton-endIcon': {
                  transform: 'translateX(4px)',
                },
              }}
            >
              Start Free Trial
            </Button>

            <Button
              variant="outlined"
              size="large"
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(96, 63, 239, 0.5)',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(96, 63, 239, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#603FEF',
                  backgroundColor: 'rgba(96, 63, 239, 0.2)',
                  boxShadow: '0 0 20px rgba(96, 63, 239, 0.3)',
                },
              }}
            >
              Schedule a Demo
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.6)',
              mt: 4,
            }}
          >
            14-day free trial • No setup fees • Cancel anytime
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;