import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiService } from '../services/apiService.js';

const Payments = () => {
    const { user, isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [exchangeRate, setExchangeRate] = useState(null);
    const [fees, setFees] = useState(null);

    const [paymentData, setPaymentData] = useState({
        // Transfer details
        amount: '',
        currency: 'ZAR',
        recipientCurrency: 'USD',
        purpose: '',
        
        // Recipient details
        recipientName: '',
        recipientEmail: '',
        recipientPhone: '',
        recipientAddress: '',
        recipientCity: '',
        recipientCountry: '',
        recipientPostalCode: '',
        
        // Banking details
        bankName: '',
        bankAddress: '',
        swiftCode: '',
        accountNumber: '',
        iban: '',
        routingNumber: '',
        
        // Additional info
        reference: '',
        notes: ''
    });

    const currencies = [
        { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
    ];

    const countries = [
        'South Africa', 'United States', 'United Kingdom', 'Germany', 'France', 'Canada',
        'Australia', 'Japan', 'Switzerland', 'Netherlands', 'Belgium',
        'Italy', 'Spain', 'Sweden', 'Norway', 'Denmark'
    ];

    const transferPurposes = [
        'Family Support',
        'Business Payment',
        'Property Purchase',
        'Education Expenses',
        'Medical Expenses',
        'Investment',
        'Salary Payment',
        'Gift',
        'Other'
    ];

    useEffect(() => {
        if (paymentData.amount && paymentData.currency && paymentData.recipientCurrency) {
            fetchExchangeRate();
        }
    }, [paymentData.amount, paymentData.currency, paymentData.recipientCurrency]);

    const fetchExchangeRate = async () => {
        try {
            const response = await apiService.getExchangeRate(
                paymentData.currency, 
                paymentData.recipientCurrency,
                paymentData.amount
            );
            setExchangeRate(response.data);
            setFees(response.data.fees);
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStepSubmit = (e) => {
        e.preventDefault();
        
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinalSubmit();
        }
    };

    const handleFinalSubmit = async () => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Mapping frontend fields to backend expected fields
            const backendPaymentData = {
                payeeName: paymentData.recipientName,
                payeeAccount: paymentData.accountNumber || paymentData.iban,
                swift: paymentData.swiftCode,
                currency: paymentData.currency,
                amount: parseFloat(paymentData.amount),
                reference: paymentData.reference || paymentData.purpose
            };

            const response = await apiService.createPayment(backendPaymentData);
            
            if (response.success) {
                setSuccess('Payment initiated successfully! Transaction ID: ' + response.data.transactionId);
                setCurrentStep(5); // Confirmation step
            } else {
                setError(response.message || 'Payment failed. Please try again.');
            }
        } catch (error) {
            setError('Payment failed. Please check your details and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrencySymbol = (currencyCode) => {
        const currency = currencies.find(c => c.code === currencyCode);
        return currency ? currency.symbol : '';
    };

    const formatAmount = (amount, currencyCode) => {
        const symbol = getCurrencySymbol(currencyCode);
        const locale = currencyCode === 'ZAR' ? 'en-ZA' : 'en-US';
        return `${symbol}${parseFloat(amount || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}`;
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            {[1, 2, 3, 4].map((step) => (
                <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
                    <div className="step-number">{step}</div>
                    <div className="step-label">
                        {step === 1 && 'Amount'}
                        {step === 2 && 'Recipient'}
                        {step === 3 && 'Banking'}
                        {step === 4 && 'Review'}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderAmountStep = () => (
        <div className="payment-step">
            <div className="step-header">
                <h2>Transfer Amount</h2>
                <p>Enter the amount you want to send</p>
            </div>

            <div className="amount-section">
                <div className="currency-input">
                    <label className="form-label">You Send</label>
                    <div className="input-with-select">
                        <input
                            type="number"
                            name="amount"
                            value={paymentData.amount}
                            onChange={handleInputChange}
                            className="form-input amount-input"
                            placeholder="0.00"
                            min="1"
                            step="0.01"
                            required
                        />
                        <select
                            name="currency"
                            value={paymentData.currency}
                            onChange={handleInputChange}
                            className="currency-select"
                        >
                            {currencies.map(currency => (
                                <option key={currency.code} value={currency.code}>
                                    {currency.code} - {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {exchangeRate && (
                    <div className="exchange-info">
                        <div className="rate-display">

                            <span>1 {paymentData.currency} = {exchangeRate.rate} {paymentData.recipientCurrency}</span>
                        </div>
                    </div>
                )}

                <div className="currency-input">
                    <label className="form-label">Recipient Gets</label>
                    <div className="input-with-select">
                        <input
                            type="text"
                            value={exchangeRate ? formatAmount(exchangeRate.recipientAmount, paymentData.recipientCurrency) : '0.00'}
                            className="form-input amount-input"
                            readOnly
                        />
                        <select
                            name="recipientCurrency"
                            value={paymentData.recipientCurrency}
                            onChange={handleInputChange}
                            className="currency-select"
                        >
                            {currencies.map(currency => (
                                <option key={currency.code} value={currency.code}>
                                    {currency.code} - {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {fees && (
                    <div className="fees-breakdown">
                        <h3>Fee Breakdown</h3>
                        <div className="fee-item">
                            <span>Transfer Fee</span>
                            <span>{formatAmount(fees.transferFee, paymentData.currency)}</span>
                        </div>
                        <div className="fee-item">
                            <span>Exchange Rate Margin</span>
                            <span>{formatAmount(fees.exchangeMargin, paymentData.currency)}</span>
                        </div>
                        <div className="fee-item total">
                            <span>Total Cost</span>
                            <span>{formatAmount(fees.totalCost, paymentData.currency)}</span>
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Purpose of Transfer</label>
                    <select
                        name="purpose"
                        value={paymentData.purpose}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                    >
                        <option value="">Select purpose</option>
                        {transferPurposes.map(purpose => (
                            <option key={purpose} value={purpose}>{purpose}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    const renderRecipientStep = () => (
        <div className="payment-step">
            <div className="step-header">
                <h2>Recipient Details</h2>
                <p>Enter the recipient's information</p>
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                        type="text"
                        name="recipientName"
                        value={paymentData.recipientName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="John Smith"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                        type="email"
                        name="recipientEmail"
                        value={paymentData.recipientEmail}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="john@example.com"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                        type="tel"
                        name="recipientPhone"
                        value={paymentData.recipientPhone}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="+1 234 567 8900"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Country *</label>
                    <select
                        name="recipientCountry"
                        value={paymentData.recipientCountry}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                    >
                        <option value="">Select country</option>
                        {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group full-width">
                    <label className="form-label">Address *</label>
                    <input
                        type="text"
                        name="recipientAddress"
                        value={paymentData.recipientAddress}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="123 Main Street"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                        type="text"
                        name="recipientCity"
                        value={paymentData.recipientCity}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="New York"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input
                        type="text"
                        name="recipientPostalCode"
                        value={paymentData.recipientPostalCode}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="10001"
                    />
                </div>
            </div>
        </div>
    );

    const renderBankingStep = () => (
        <div className="payment-step">
            <div className="step-header">
                <h2>Banking Details</h2>
                <p>Enter the recipient's bank information</p>
            </div>

            <div className="form-grid">
                <div className="form-group full-width">
                    <label className="form-label">Bank Name *</label>
                    <input
                        type="text"
                        name="bankName"
                        value={paymentData.bankName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Bank of America"
                        required
                    />
                </div>

                <div className="form-group full-width">
                    <label className="form-label">Bank Address</label>
                    <input
                        type="text"
                        name="bankAddress"
                        value={paymentData.bankAddress}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="100 North Tryon Street, Charlotte, NC"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">SWIFT/BIC Code *</label>
                    <input
                        type="text"
                        name="swiftCode"
                        value={paymentData.swiftCode}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="ABZAZAJJ (8-11 characters)"
                        required
                        pattern="[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?"
                        title="SWIFT code must be 8-11 characters: 6 letters + 2 alphanumeric + optional 3 alphanumeric"
                        style={{ textTransform: 'uppercase' }}
                        maxLength="11"
                    />
                    <small className="form-hint">Format: 6 letters + 2-5 numbers/letters (e.g., ABZAZAJJ123)</small>
                </div>

                <div className="form-group">
                    <label className="form-label">Account Number *</label>
                    <input
                        type="text"
                        name="accountNumber"
                        value={paymentData.accountNumber}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="12345678 (8-12 digits)"
                        required
                        pattern="[0-9]{8,12}"
                        title="Account number must be 8-12 digits only"
                        maxLength="12"
                    />
                    <small className="form-hint">Must be 8-12 digits only (no letters or special characters)</small>
                </div>

                <div className="form-group">
                    <label className="form-label">IBAN</label>
                    <input
                        type="text"
                        name="iban"
                        value={paymentData.iban}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="GB29 NWBK 6016 1331 9268 19"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Routing Number</label>
                    <input
                        type="text"
                        name="routingNumber"
                        value={paymentData.routingNumber}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="021000021"
                    />
                </div>

                <div className="form-group full-width">
                    <label className="form-label">Reference (Optional)</label>
                    <input
                        type="text"
                        name="reference"
                        value={paymentData.reference}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Invoice #12345"
                    />
                </div>

                <div className="form-group full-width">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                        name="notes"
                        value={paymentData.notes}
                        onChange={handleInputChange}
                        className="form-input"
                        rows="3"
                        placeholder="Any additional information for the recipient"
                    />
                </div>
            </div>
        </div>
    );

    const renderReviewStep = () => (
        <div className="payment-step">
            <div className="step-header">
                <h2>Review & Confirm</h2>
                <p>Please review all details before confirming</p>
            </div>

            <div className="review-sections">
                {/* Transfer Summary */}
                <div className="review-section">
                    <h3>Transfer Summary</h3>
                    <div className="review-item">
                        <span>You Send</span>
                        <span>{formatAmount(paymentData.amount, paymentData.currency)}</span>
                    </div>
                    <div className="review-item">
                        <span>Recipient Gets</span>
                        <span>{exchangeRate ? formatAmount(exchangeRate.recipientAmount, paymentData.recipientCurrency) : 'Calculating...'}</span>
                    </div>
                    <div className="review-item">
                        <span>Exchange Rate</span>
                        <span>{exchangeRate ? `1 ${paymentData.currency} = ${exchangeRate.rate} ${paymentData.recipientCurrency}` : 'Loading...'}</span>
                    </div>
                    <div className="review-item">
                        <span>Total Cost</span>
                        <span>{fees ? formatAmount(fees.totalCost, paymentData.currency) : 'Calculating...'}</span>
                    </div>
                    <div className="review-item">
                        <span>Purpose</span>
                        <span>{paymentData.purpose}</span>
                    </div>
                </div>

                {/* Recipient Details */}
                <div className="review-section">
                    <h3>Recipient Details</h3>
                    <div className="review-item">
                        <span>Name</span>
                        <span>{paymentData.recipientName}</span>
                    </div>
                    <div className="review-item">
                        <span>Country</span>
                        <span>{paymentData.recipientCountry}</span>
                    </div>
                    <div className="review-item">
                        <span>Address</span>
                        <span>{paymentData.recipientAddress}, {paymentData.recipientCity}</span>
                    </div>
                    {paymentData.recipientEmail && (
                        <div className="review-item">
                            <span>Email</span>
                            <span>{paymentData.recipientEmail}</span>
                        </div>
                    )}
                </div>

                {/* Banking Details */}
                <div className="review-section">
                    <h3>Banking Details</h3>
                    <div className="review-item">
                        <span>Bank Name</span>
                        <span>{paymentData.bankName}</span>
                    </div>
                    <div className="review-item">
                        <span>SWIFT Code</span>
                        <span>{paymentData.swiftCode}</span>
                    </div>
                    <div className="review-item">
                        <span>Account Number</span>
                        <span>****{paymentData.accountNumber.slice(-4)}</span>
                    </div>
                    {paymentData.iban && (
                        <div className="review-item">
                            <span>IBAN</span>
                            <span>{paymentData.iban}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="security-notice">
                <div>
                    <h4>Security Notice</h4>
                    <p>
                        Your transfer will be processed securely using bank-grade encryption. 
                        You will receive email confirmations at each stage of the process.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderConfirmationStep = () => (
        <div className="payment-step confirmation">
            <div className="confirmation-icon">
            </div>
            <h2>Payment Initiated Successfully!</h2>
            <p>Your international transfer has been submitted for processing.</p>
            
            <div className="confirmation-details">
                <div className="detail-item">
                    <div>
                        <h4>Processing Time</h4>
                        <p>1-3 business days</p>
                    </div>
                </div>
                <div className="detail-item">
                    <div>
                        <h4>Security</h4>
                        <p>Bank-grade encryption</p>
                    </div>
                </div>
            </div>

            <div className="confirmation-actions">
                <button 
                    onClick={() => window.location.href = '/history'} 
                    className="btn btn-primary"
                >
                    View Transaction History
                </button>
                <button 
                    onClick={() => {
                        setCurrentStep(1);
                        setPaymentData({
                            amount: '', currency: 'USD', recipientCurrency: 'EUR', purpose: '',
                            recipientName: '', recipientEmail: '', recipientPhone: '',
                            recipientAddress: '', recipientCity: '', recipientCountry: '',
                            recipientPostalCode: '', bankName: '', bankAddress: '',
                            swiftCode: '', accountNumber: '', iban: '', routingNumber: '',
                            reference: '', notes: ''
                        });
                        setSuccess('');
                    }}
                    className="btn btn-secondary"
                >
                    Send Another Payment
                </button>
            </div>
        </div>
    );

    if (!isAuthenticated) {
        return (
            <div className="auth-required">
                <h2>Authentication Required</h2>
                <p>Please log in to access the payments portal.</p>
            </div>
        );
    }

    return (
        <div className="payments">
            <div className="container">
                <div className="payments-header">
                    <h1>International Payments</h1>
                    <p>Send money securely to over 200 countries worldwide</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {success && currentStep !== 5 && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <div className="payment-container">
                    {currentStep !== 5 && renderStepIndicator()}

                    <form onSubmit={handleStepSubmit} className="payment-form">
                        {currentStep === 1 && renderAmountStep()}
                        {currentStep === 2 && renderRecipientStep()}
                        {currentStep === 3 && renderBankingStep()}
                        {currentStep === 4 && renderReviewStep()}
                        {currentStep === 5 && renderConfirmationStep()}

                        {currentStep < 5 && (
                            <div className="form-actions">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                        className="btn btn-secondary"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="loading-spinner"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {currentStep === 4 ? 'Confirm Payment' : 'Continue'}
                                            →
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <style jsx>{`
                .payments {
                    min-height: calc(100vh - 80px);
                    background: var(--background-color);
                    padding: 2rem 0;
                }

                .payments-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .payments-header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .payments-header p {
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                }

                .payment-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: var(--card-background);
                    border-radius: 16px;
                    box-shadow: var(--shadow-lg);
                    overflow: hidden;
                }

                .step-indicator {
                    display: flex;
                    justify-content: space-between;
                    padding: 2rem;
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    opacity: 0.5;
                    transition: opacity 0.3s ease;
                }

                .step.active {
                    opacity: 1;
                }

                .step-number {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .step.active .step-number {
                    background: white;
                    color: var(--primary-color);
                }

                .step-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .payment-form {
                    padding: 2rem;
                }

                .payment-step {
                    margin-bottom: 2rem;
                }

                .step-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .step-icon {
                    width: 60px;
                    height: 60px;
                    background: var(--primary-light);
                    color: var(--primary-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    margin: 0 auto 1rem;
                }

                .step-header h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .step-header p {
                    color: var(--text-secondary);
                    font-size: 1rem;
                }

                .amount-section {
                    max-width: 500px;
                    margin: 0 auto;
                }

                .currency-input {
                    margin-bottom: 2rem;
                }

                .input-with-select {
                    display: flex;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    overflow: hidden;
                    transition: border-color 0.3s ease;
                }

                .input-with-select:focus-within {
                    border-color: var(--primary-color);
                }

                .amount-input {
                    flex: 1;
                    border: none;
                    padding: 1rem;
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .currency-select {
                    border: none;
                    background: var(--background-light);
                    padding: 1rem;
                    min-width: 180px;
                    border-left: 1px solid var(--border-color);
                }

                .exchange-info {
                    text-align: center;
                    margin: 1.5rem 0;
                    padding: 1rem;
                    background: var(--primary-light);
                    border-radius: 8px;
                }

                .rate-display {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: var(--primary-color);
                    font-weight: 600;
                }

                .fees-breakdown {
                    background: var(--background-light);
                    padding: 1.5rem;
                    border-radius: 8px;
                    margin-top: 2rem;
                }

                .fees-breakdown h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                }

                .fee-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid var(--border-color);
                }

                .fee-item:last-child {
                    border-bottom: none;
                }

                .fee-item.total {
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-top: 0.5rem;
                    padding-top: 1rem;
                    border-top: 2px solid var(--border-color);
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .full-width {
                    grid-column: 1 / -1;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-label {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }

                .form-input {
                    padding: 0.75rem;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }

                .form-hint {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-top: 0.25rem;
                    font-style: italic;
                }

                .review-sections {
                    display: grid;
                    gap: 2rem;
                }

                .review-section {
                    background: var(--background-light);
                    padding: 1.5rem;
                    border-radius: 8px;
                }

                .review-section h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                }

                .review-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid var(--border-color);
                }

                .review-item:last-child {
                    border-bottom: none;
                }

                .review-item span:first-child {
                    color: var(--text-secondary);
                }

                .review-item span:last-child {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .security-notice {
                    display: flex;
                    gap: 1rem;
                    padding: 1.5rem;
                    background: #f0f9ff;
                    border-radius: 8px;
                    margin-top: 2rem;
                }

                .security-notice svg {
                    color: var(--primary-color);
                    font-size: 1.25rem;
                    margin-top: 0.25rem;
                }

                .security-notice h4 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }

                .security-notice p {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    line-height: 1.5;
                }

                .confirmation {
                    text-align: center;
                    padding: 3rem 2rem;
                }

                .confirmation-icon {
                    width: 80px;
                    height: 80px;
                    background: var(--success-color);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    margin: 0 auto 2rem;
                }

                .confirmation h2 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                }

                .confirmation p {
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                }

                .confirmation-details {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .detail-item svg {
                    color: var(--primary-color);
                    font-size: 1.25rem;
                }

                .detail-item h4 {
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                    color: var(--text-primary);
                }

                .detail-item p {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .confirmation-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .form-actions {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid var(--border-color);
                }

                .btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 2rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }

                .btn-primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-2px);
                }

                .btn-secondary {
                    background: var(--background-light);
                    color: var(--text-primary);
                    border: 2px solid var(--border-color);
                }

                .btn-secondary:hover {
                    background: var(--background-color);
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .auth-required {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--text-secondary);
                }

                .auth-required svg {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    color: var(--text-light);
                }

                @media (max-width: 768px) {
                    .payments {
                        padding: 1rem 0;
                    }

                    .payments-header h1 {
                        font-size: 2rem;
                    }

                    .step-indicator {
                        padding: 1rem;
                    }

                    .step-label {
                        display: none;
                    }

                    .payment-form {
                        padding: 1.5rem;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .confirmation-details {
                        flex-direction: column;
                        align-items: center;
                    }

                    .confirmation-actions {
                        flex-direction: column;
                    }

                    .form-actions {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Payments;
