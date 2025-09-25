import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, database } from "../config/firebase";
import {
  Alert,
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  Chip,
  Stack,
  Card,
  CardContent,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import samplechat from "../assets/samplechat.jpg";
import samplefund from "../assets/kkr.jpg"; 
import Footer from "../components/footer";
import { Navbar } from "react-bootstrap";
import {
  QrCode,
  Smartphone,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Zap,
  Phone
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const QRDisplay = () => {
  const { userId } = useParams();
  const [qrCodes, setQrCode] = useState(null);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [qrimg, setQrImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [paymentAttempted, setPaymentAttempted] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(database, "Users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username);
          setRole(data.role);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage("Failed to load user profile.");
      }
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    const fetchLatestQRCode = async () => {
      try {
        setLoading(true);
        const qrDocRef = doc(database, "Users", userId, "profileDetails", "details");
        const docSnap = await getDoc(qrDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setQrCode(data.decodedQr);
          setQrImg(data.qrCode);
        } else {
          setMessage("No QR code data found for this user.");
        }
      } catch (error) {
        console.error("Error fetching QR code:", error);
        setMessage("⚠ Failed to load QR code.");
      } finally {
        setLoading(false);
      }
    };
    fetchLatestQRCode();
  }, [userId]);

  // Enhanced payment handling functions
  const handleDirectPayment = () => {
    if (!qrCodes) return;

    setPaymentAttempted(true);

    // Detect mobile device
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (qrCodes.startsWith('upi://')) {
      // Direct UPI link
      if (isMobile) {
        // On mobile, try to open the app directly
        window.location.href = qrCodes;
      } else {
        // On desktop, show instructions
        window.open(qrCodes, '_blank');
      }
    } else if (qrCodes.startsWith('http')) {
      // Web-based payment link
      window.open(qrCodes, '_blank');
    } else {
      // Fallback: try to construct a UPI link
      const upiLink = qrCodes.includes('upi://') ? qrCodes : `upi://pay?${qrCodes}`;
      if (isMobile) {
        window.location.href = upiLink;
      } else {
        window.open(upiLink, '_blank');
      }
    }

    // Show success message after a delay
    setTimeout(() => {
      setMessage('🚀 Payment app should have opened. If not, try copying the link below or scanning the QR code.');
    }, 2000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrCodes);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = qrCodes;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const getPaymentButtonText = () => {
    if (qrCodes?.startsWith('upi://')) {
      return 'Pay with UPI App';
    } else if (qrCodes?.includes('paytm')) {
      return 'Pay with Paytm';
    } else if (qrCodes?.includes('phonepe')) {
      return 'Pay with PhonePe';
    } else if (qrCodes?.includes('gpay') || qrCodes?.includes('googlepay')) {
      return 'Pay with Google Pay';
    } else {
      return 'Open Payment App';
    }
  };

  const getPaymentAppIcon = () => {
    if (qrCodes?.includes('paytm')) return '💙';
    if (qrCodes?.includes('phonepe')) return '💜';
    if (qrCodes?.includes('gpay') || qrCodes?.includes('googlepay')) return '🟡';
    return '💳';
  };

  const handleManualPayment = () => {
    // For users who want to use their own payment app
    const paymentInstructions = `
To pay manually:
1. Open any UPI app (Google Pay, PhonePe, Paytm, etc.)
2. Tap "Scan QR Code" or "Pay"
3. Point your camera at the QR code above
4. Enter the amount and complete payment
    `;
    alert(paymentInstructions);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <QrCode size={48} color="#1976d2" />
            </motion.div>
            <Typography variant="h6" sx={{ mt: 2, color: '#1976d2' }}>
              Loading Payment Details...
            </Typography>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>  
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h4" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            💳 Quick Payment Portal
          </Typography>
          <Typography variant="h6" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
            Send money instantly via verified QR code
          </Typography>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              severity={paymentAttempted ? "info" : "error"} 
              sx={{ mb: 3, borderRadius: 2 }}
              icon={paymentAttempted ? <ExternalLink /> : <AlertTriangle />}
            >
              {message}
            </Alert>
          </motion.div>
        )}

        {!qrCodes ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ maxWidth: 500, mx: 'auto', textAlign: "center" }}>
              <CardContent sx={{ p: 4 }}>
                <AlertTriangle size={64} color="#ff9800" style={{ marginBottom: 16 }} />
                <Typography variant="h6" gutterBottom>
                  No Payment Method Available
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {username ? `${username} hasn't set up their payment QR code yet.` : "Loading user information..."}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card elevation={8} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  {/* Header */}
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    p: 3, 
                    textAlign: 'center' 
                  }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                      {getPaymentAppIcon()} Pay {username}
                    </Typography>
                    <Chip 
                      label="Verified Payment" 
                      icon={<CheckCircle size={16} />}
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' }
                      }} 
                    />
                  </Box>

                  <CardContent sx={{ p: 4 }}>
                    {/* QR Code Display */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Box sx={{ 
                        display: 'inline-block', 
                        p: 2, 
                        backgroundColor: 'white', 
                        borderRadius: 2, 
                        boxShadow: 3,
                        border: '3px solid #e3f2fd'
                      }}>
                        <img src={qrimg} alt="Payment QR Code" style={{ width: 180, height: 180 }} />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                        Scan with any UPI app or use the buttons below
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Stack spacing={2}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => {
                          if (!qrCodes) return;
                          const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                          if (qrCodes.startsWith('upi://')) {
                            if (isMobile) {
                              window.location.href = qrCodes;
                            } else {
                              alert('UPI payment links only work on mobile devices with a UPI app installed. Please scan the QR code with your phone.');
                            }
                          } else if (qrCodes.startsWith('http')) {
                            window.open(qrCodes, '_blank');
                          } else {
                            const upiLink = qrCodes.includes('upi://') ? qrCodes : `upi://pay?${qrCodes}`;
                            if (isMobile) {
                              window.location.href = upiLink;
                            } else {
                              alert('UPI payment links only work on mobile devices with a UPI app installed. Please scan the QR code with your phone.');
                            }
                          }
                        }}
                        startIcon={<Smartphone />}
                        sx={{ 
                          py: 1.5, 
                          fontSize: '1.1rem',
                          background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #45a049 30%, #4CAF50 90%)',
                            transform: 'translateY(-1px)',
                            boxShadow: 6
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Zap size={20} />
                          {getPaymentButtonText()}
                        </Box>
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={handleManualPayment}
                        startIcon={<Phone />}
                        sx={{ 
                          py: 1,
                          borderColor: '#FF9800',
                          color: '#FF9800',
                          '&:hover': {
                            backgroundColor: '#FF9800',
                            color: 'white'
                          }
                        }}
                      >
                        Use Your Own UPI App
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={handleCopyLink}
                        startIcon={copySuccess ? <CheckCircle /> : <Copy />}
                        sx={{ 
                          py: 1, 
                          borderColor: copySuccess ? '#4CAF50' : '#1976d2',
                          color: copySuccess ? '#4CAF50' : '#1976d2',
                          '&:hover': {
                            backgroundColor: copySuccess ? '#4CAF50' : '#1976d2',
                            color: 'white'
                          }
                        }}
                      >
                        {copySuccess ? 'Link Copied!' : 'Copy Payment Link'}
                      </Button>

                      {/* Direct link display for troubleshooting */}
                      {qrCodes && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Payment Link (for manual use):
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              wordBreak: 'break-all', 
                              fontFamily: 'monospace', 
                              fontSize: '0.8rem',
                              color: '#1976d2'
                            }}
                          >
                            {qrCodes}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Enhanced Instructions */}
                    <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
                        💡 Multiple ways to pay:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="div">
                        <Box component="span" sx={{ display: 'block', mb: 0.5 }}>🚀 <strong>Fastest:</strong> Click "Pay with UPI App" - opens your default payment app</Box>
                        <Box component="span" sx={{ display: 'block', mb: 0.5 }}>📱 <strong>Manual:</strong> Open any UPI app and scan the QR code above</Box>
                        <Box component="span" sx={{ display: 'block', mb: 0.5 }}>📋 <strong>Link:</strong> Copy the payment link and paste in your UPI app</Box>
                        <Box component="span" sx={{ display: 'block' }}>💬 <strong>Note:</strong> Works with Google Pay, PhonePe, Paytm, and all UPI apps</Box>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        )}

        {/* Animated Scroll Info */}
        <Box sx={{ mt: 10 }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <Typography variant="h5" gutterBottom color="primary">
              Why Make a Payment?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Whether you're tipping a creator, supporting an athlete, or donating to an organization —
              your payment goes directly to the user through their verified QR code.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <img
                src={samplechat}
                alt="Chat payment screenshot"
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  height: 'auto',
                  borderRadius: '8px',
                  display: 'block',
                }}
              />
            </Box>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Box sx={{ mt: 8 }}>
              <Typography variant="h5" gutterBottom color="primary">
                Safe. Verified. Instant.
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                All QR codes on our platform are reviewed and verified. Your payment is sent directly through UPI to their linked
                account — no middleman involved.
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <img
                  src={samplefund}
                  alt="Crowdfunding screenshot"
                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    height: 'auto',
                    borderRadius: '8px',
                    display: 'block',
                  }}
                />
              </Box>
            </Box>
          </motion.div>
        </Box>

        {/* Success Snackbar */}
        <Snackbar
          open={copySuccess}
          autoHideDuration={3000}
          onClose={() => setCopySuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Payment link copied to clipboard!
          </Alert>
        </Snackbar>
      </Container>
      <br />
      <Footer />
    </>
  );
};

export default QRDisplay;
