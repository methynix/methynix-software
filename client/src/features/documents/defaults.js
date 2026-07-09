import { COMPANY } from "./company";
import { todayISO } from "./format";
import { defaultStages } from "./pdf/ContractPDF";

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const emptyClient = () => ({ name: "", email: "", phone: "", address: "" });

export const defaultWorking = (type) => {
  const now = new Date();
  if (type === "invoice") {
    return {
      type: "invoice",
      number: "",
      status: "draft",
      title: "",
      client: emptyClient(),
      total: 0,
      data: {
        date: todayISO(),
        dueDate: "",
        items: [
          { service: "Annual Domain Registration", quantity: "", unitPrice: "" },
          { service: "Annual Web Hosting", quantity: "", unitPrice: "" },
          { service: "Website Development", quantity: "", unitPrice: "" },
          { service: "Maintenance & Support", quantity: "", unitPrice: "" },
        ],
        paymentMobile: COMPANY.paymentMobile,
        notes: "",
      },
    };
  }

  if (type === "receipt") {
    return {
      type: "receipt",
      number: "",
      status: "draft",
      title: "",
      client: emptyClient(),
      total: 0,
      data: {
        date: todayISO(),
        paymentFor: "",
        method: "mobile",
        methodOther: "",
        totalAmount: "",
        amountPaid: "",
        balanceDue: "",
        amountInWords: "",
        receivedByName: COMPANY.operator,
        signature: null,
      },
    };
  }

  // contract
  return {
    type: "contract",
    number: "",
    status: "draft",
    title: "",
    client: emptyClient(),
    total: 0,
    data: {
      day: ordinal(now.getDate()),
      month: MONTHS[now.getMonth()],
      year: String(now.getFullYear()),
      providerOperator: COMPANY.operator,
      projectDescription: "",
      totalCost: "",
      stages: defaultStages(0),
      paymentMethod: "Mobile Money / Bank Transfer",
      providerSignName: COMPANY.operator,
      providerSignTitle: "Founder",
      providerSignature: null,
    },
  };
};
