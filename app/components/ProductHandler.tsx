"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "ai/react";
import { useToast } from "../context/Toast";

const PRODUCT_API_URL = "https://6p98v73te8.execute-api.us-east-1.amazonaws.com/prod/products";
const ORDER_API_URL = "https://6p98v73te8.execute-api.us-east-1.amazonaws.com/prod/orders";
const INVOICE_API_URL = "https://6p98v73te8.execute-api.us-east-1.amazonaws.com/prod/invoices";
const SUPPLIER_API_URL = "https://6p98v73te8.execute-api.us-east-1.amazonaws.com/prod/suppliers";

interface Product {
  productId?: string;
  name: string;
  price: number;
  rating: number;
  stockQuantity: number;
}

const createProduct = async (product: Product) => {
  try {
    console.log('Creating product:', product);
    const response = await fetch(PRODUCT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server responded with ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error creating product:', error);
    throw error;
  }
};

interface Order {
  orderId?: string;
  name: string;
  items: any[];
  totalAmount: number;
  status: string;
}

const createOrder = async (order: Order) => {
  try {
    console.log('Creating order:', order);
    const response = await fetch(ORDER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server responded with ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
};

interface Invoice {
  invoiceId?: string;
  customerName: string;
  date: string;
  totalAmount: number;
  items: any[];
}

const createInvoice = async (invoice: Invoice) => {
  try {
    console.log('Creating invoice:', invoice);
    const response = await fetch(INVOICE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server responded with ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    throw error;
  }
};

interface Supplier {
  supplierId?: string;
  name: string;
  totalPayment: number;
  paymentDue: number;
}

const createSupplier = async (supplier: Supplier) => {
  try {
    console.log('Creating supplier:', supplier);
    const response = await fetch(SUPPLIER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server responded with ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Error creating supplier:', error);
    throw error;
  }
};

interface ProductHandlerProps {
  chatMessages: Message[];
  append: (message: Message) => void;
}

export default function ProductHandler({ chatMessages, append }: ProductHandlerProps) {
  const { toast } = useToast();
  const [processedMessageIds, setProcessedMessageIds] = useState(new Set());
  const currentJsonBuffer = useRef("");
  const hasProcessed = useRef(false);

  useEffect(() => {
    hasProcessed.current = false;
    for (const message of chatMessages) {
      if (message.role === "assistant" && !processedMessageIds.has(message.id) && !hasProcessed.current) {
        currentJsonBuffer.current += message.content;
        console.log('Processing message:', message.content);
        
        // Try to find JSON content
        let jsonStart = currentJsonBuffer.current.lastIndexOf("```json");
        let jsonEnd = jsonStart !== -1 ? currentJsonBuffer.current.indexOf("```", jsonStart + 7) : -1;
        
        // If no json tag found, try without it
        if (jsonStart === -1) {
          jsonStart = currentJsonBuffer.current.lastIndexOf("```");
          jsonEnd = jsonStart !== -1 ? currentJsonBuffer.current.indexOf("```", jsonStart + 3) : -1;
        }

        if (jsonStart !== -1 && jsonEnd !== -1) {
          try {
            const jsonString = currentJsonBuffer.current
              .substring(jsonStart + (currentJsonBuffer.current.startsWith("```json", jsonStart) ? 7 : 3), jsonEnd)
              .trim();
            
            console.log('Extracted JSON string:', jsonString);
            const parsedMessage = JSON.parse(jsonString);
            console.log('Parsed JSON:', parsedMessage);
            
            // Product handling
            if (parsedMessage.name && parsedMessage.price !== undefined && 
                parsedMessage.stockQuantity !== undefined && parsedMessage.rating !== undefined) {
              const productId = parsedMessage.productId || crypto.randomUUID();
              const productToSend = {
                productId,
                name: parsedMessage.name,
                price: parseFloat(parsedMessage.price),
                rating: parseInt(parsedMessage.rating),
                stockQuantity: parseInt(parsedMessage.stockQuantity),
              };
              console.log('Sending product:', productToSend);
              hasProcessed.current = true;
              setProcessedMessageIds(prev => new Set(prev).add(message.id));
              currentJsonBuffer.current = "";
              createProduct(productToSend)
                .then(() => toast.success('✅ Product created successfully!'))
                .catch(error => {
                  console.error('Product creation failed:', error);
                  toast.error(`❌ Error creating product: ${error.message}`);
                });
            }
            
            // Order handling
            else if (parsedMessage.name && parsedMessage.items && 
                     parsedMessage.totalAmount !== undefined && parsedMessage.status) {
              const orderId = parsedMessage.orderId || crypto.randomUUID();
              const orderToSend = {
                orderId,
                name: parsedMessage.name,
                items: parsedMessage.items,
                totalAmount: parseFloat(parsedMessage.totalAmount),
                status: parsedMessage.status,
              };
              console.log('Sending order:', orderToSend);
              hasProcessed.current = true;
              setProcessedMessageIds(prev => new Set(prev).add(message.id));
              currentJsonBuffer.current = "";
              createOrder(orderToSend)
                .then(() => toast.success('✅ Order placed successfully!'))
                .catch(error => {
                  console.error('Order creation failed:', error);
                  toast.error(`❌ Error placing order: ${error.message}`);
                });
            }
            
            // Invoice handling
            else if (parsedMessage.customerName && parsedMessage.date && 
                     parsedMessage.totalAmount !== undefined && parsedMessage.items) {
              const invoiceId = parsedMessage.invoiceId || crypto.randomUUID();
              const invoiceToSend = {
                invoiceId,
                customerName: parsedMessage.customerName,
                date: parsedMessage.date,
                totalAmount: parseFloat(parsedMessage.totalAmount),
                items: parsedMessage.items,
              };
              console.log('Sending invoice:', invoiceToSend);
              hasProcessed.current = true;
              setProcessedMessageIds(prev => new Set(prev).add(message.id));
              currentJsonBuffer.current = "";
              createInvoice(invoiceToSend)
                .then(() => toast.success('✅ Invoice generated successfully!'))
                .catch(error => {
                  console.error('Invoice creation failed:', error);
                  toast.error(`❌ Error generating invoice: ${error.message}`);
                });
            }
            
            // Supplier handling
            else if (parsedMessage.name && parsedMessage.totalPayment !== undefined && 
                     parsedMessage.paymentDue !== undefined) {
              const supplierId = parsedMessage.supplierId || crypto.randomUUID();
              const supplierToSend = {
                supplierId,
                name: parsedMessage.name,
                totalPayment: parseFloat(parsedMessage.totalPayment),
                paymentDue: parseFloat(parsedMessage.paymentDue),
              };
              console.log('Sending supplier:', supplierToSend);
              hasProcessed.current = true;
              setProcessedMessageIds(prev => new Set(prev).add(message.id));
              currentJsonBuffer.current = "";
              createSupplier(supplierToSend)
                .then(() => toast.success('✅ Supplier created successfully!'))
                .catch(error => {
                  console.error('Supplier creation failed:', error);
                  toast.error(`❌ Error creating supplier: ${error.message}`);
                });
            }

          } catch (error) {
            console.error("❌ Error parsing JSON:", error);
            currentJsonBuffer.current = "";
          }
        }
      }
    }
  }, [chatMessages, append, toast]);

  return null;
}
