import React, { useEffect, useRef, useState } from "react";
import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

export type PaymentState = {
    touched: boolean;
    valid: boolean;
    token?: string;
    pending?: boolean;
};

interface PaymentFormProps {
    onChange: (state: PaymentState) => void;
}

type FieldErrors = {
    cardNumber?: string;
    expirationDate?: string;
    cvv?: string;
    billingZip?: string;
};

export default function PaymentForm({ onChange }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [errors, setErrors] = useState<FieldErrors>({});
    const [complete, setComplete] = useState({
        number: false,
        expiry: false,
        cvc: false,
    });
    const [billingZip, setBillingZip] = useState("");
    const [tokenId, setTokenId] = useState<string | undefined>(undefined);
    const [pending, setPending] = useState(false);

    const lastTokenizeKey = useRef<string>("");

    // ZIP validation
    const zipError = (zip: string) =>
        zip.length === 0
            ? "ZIP code is required"
            : /^[0-9]{5}$/.test(zip)
                ? ""
                : "Please enter a valid 5-digit ZIP code";

    // Handlers
    const onNumberChange = (e: any) => {
        setComplete((c) => ({ ...c, number: !!e.complete }));
        setErrors((prev) => ({ ...prev, cardNumber: e.error?.message || "" }));
    };
    const onExpiryChange = (e: any) => {
        setComplete((c) => ({ ...c, expiry: !!e.complete }));
        setErrors((prev) => ({ ...prev, expirationDate: e.error?.message || "" }));
    };
    const onCvcChange = (e: any) => {
        setComplete((c) => ({ ...c, cvc: !!e.complete }));
        setErrors((prev) => ({ ...prev, cvv: e.error?.message || "" }));
    };
    const onZipChange = (v: string) => {
        setBillingZip(v);
        complete.number ? setErrors((prev) => ({ ...prev, billingZip: zipError(v) })) : setErrors((prev) => ({ ...prev, billingZip: "" }));
    };

    // Effect: check validity + tokenize
    useEffect(() => {
        if (!stripe || !elements) return;

        const hasAnyInput =
            complete.number || complete.expiry || complete.cvc || billingZip.length > 0;

        if (!hasAnyInput) {
            // reset to untouched
            onChange({ touched: false, valid: false, token: undefined, pending: false });
            setTokenId(undefined);
            return;
        }

        // user started typing → touched = true
        const allComplete = complete.number && complete.expiry && complete.cvc;
        const zipValid = zipError(billingZip) === "";

        const shouldTokenize = allComplete && zipValid;

        onChange({
            touched: true,
            valid: shouldTokenize && !!tokenId,
            token: tokenId,
            pending,
        });

        if (shouldTokenize) {
            const key = `${complete.number}-${complete.expiry}-${complete.cvc}-${billingZip}`;
            if (key === lastTokenizeKey.current || pending) return;

            lastTokenizeKey.current = key;
            const cardEl = elements.getElement(CardNumberElement);
            if (!cardEl) return;

            setPending(true);
            stripe
                .createToken(cardEl, { address_zip: billingZip })
                .then(({ token, error }) => {
                    setPending(false);
                    if (error) {
                        setErrors((prev) => ({
                            ...prev,
                            cardNumber: error.message || "Invalid card",
                        }));
                        setTokenId(undefined);
                        onChange({ touched: true, valid: false, token: undefined, pending: false });
                    } else {
                        setTokenId(token?.id);
                        onChange({ touched: true, valid: true, token: token?.id, pending: false });
                    }
                })
                .catch(() => {
                    setPending(false);
                    setErrors((prev) => ({
                        ...prev,
                        cardNumber: "Something went wrong. Try again.",
                    }));
                    setTokenId(undefined);
                    onChange({ touched: true, valid: false, token: undefined, pending: false });
                });
        }
    }, [stripe, elements, complete, billingZip, pending, tokenId]);

    // Stripe input style
    const stripeStyle = {
        style: {
            base: {
                fontSize: "14px",
                color: "#000",
                "::placeholder": { color: "#C0C5CC" },
            },
        },
    };

    return (
        <div className="px-2 py-2 space-y-4 sm:space-y-6">
            {/* Card Number */}
            <div>
                <label className="block text-sm font-medium text-neutral-500 text-left mb-1">
                    Card number
                </label>
                <div className="relative">
                    <div
                        className={`w-full p-2 sm:p-2.5 pr-6 border rounded-full text-sm ${errors.cardNumber ? "border-red-500" : "border-neutral-100"
                            }`}
                    >
                        <CardNumberElement options={stripeStyle} onChange={onNumberChange} />
                    </div>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm pointer-events-none">
                        *
                    </span>
                </div>
                {errors.cardNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                )}
            </div>

            {/* Expiration + CVV */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="w-full sm:w-1/2">
                    <label className="block text-sm font-medium text-neutral-500 text-left mb-1">
                        Expiration date
                    </label>
                    <div className="relative">
                        <div
                            className={`w-full p-2 sm:p-2.5 pr-6 border rounded-full text-sm ${errors.expirationDate ? "border-red-500" : "border-neutral-100"
                                }`}
                        >
                            <CardExpiryElement options={stripeStyle} onChange={onExpiryChange} />
                        </div>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm pointer-events-none">
                            *
                        </span>
                    </div>
                    {errors.expirationDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.expirationDate}</p>
                    )}
                </div>

                <div className="w-full sm:w-1/2">
                    <label className="block text-sm font-medium text-neutral-500 text-left mb-1">
                        CVV
                    </label>
                    <div className="relative">
                        <div
                            className={`w-full p-2 sm:p-2.5 pr-6 border rounded-full text-sm ${errors.cvv ? "border-red-500" : "border-neutral-100"
                                }`}
                        >
                            <CardCvcElement options={stripeStyle} onChange={onCvcChange} />
                        </div>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm pointer-events-none">
                            *
                        </span>
                    </div>
                    {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                </div>
            </div>

            {/* Billing ZIP */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-500 text-left mb-1">
                    Billing ZIP
                </label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="12345"
                        value={billingZip}
                        onChange={(e) => onZipChange(e.target.value)}
                        maxLength={5}
                        className={`w-full p-2 sm:p-2.5 pr-6 border rounded-full text-sm ${errors.billingZip ? "border-red-500" : "border-neutral-100"
                            } ${billingZip ? "text-black" : "text-[#9CA3AF]"} placeholder:text-[#C0C5CC]`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm pointer-events-none">
                        *
                    </span>
                </div>
                {errors.billingZip && (
                    <p className="text-red-500 text-xs mt-1">{errors.billingZip}</p>
                )}
            </div>
        </div>
    );
}
