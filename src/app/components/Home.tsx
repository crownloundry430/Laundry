import { Link } from "react-router";
import { Shirt, Droplet, Wind, Sparkles, Clock, MapPin, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function Home() {
  const services = [
    {
      icon: Shirt,
      title: "Wash & Fold",
      description: "Regular laundry service",
      price: "$1.50/lb",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Droplet,
      title: "Dry Cleaning",
      description: "Professional dry cleaning",
      price: "$8.99/item",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Wind,
      title: "Wash & Iron",
      description: "Washed and pressed",
      price: "$2.50/lb",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Sparkles,
      title: "Premium Care",
      description: "Delicate items",
      price: "$12.99/item",
      color: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 pt-8 pb-12 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-1">Welcome Back! 👋</h1>
            <p className="text-blue-100 text-sm">Let's get your laundry done</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
        </div>

        {/* Active Order Card */}
        <Card className="bg-white p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Order #12345</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  In Progress
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Wash & Fold - 5.5 lbs</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Delivery today at 6:00 PM</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/new-order">
            <Button className="w-full h-auto py-4 bg-blue-600 hover:bg-blue-700 flex flex-col gap-2">
              <ShoppingBag className="w-6 h-6" />
              <span>New Order</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex flex-col gap-2 bg-white"
          >
            <MapPin className="w-6 h-6" />
            <span>Schedule Pickup</span>
          </Button>
        </div>
      </div>

      {/* Services */}
      <div className="px-6 mb-6">
        <h2 className="text-lg mb-4">Our Services</h2>
        <div className="grid grid-cols-2 gap-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium mb-1">{service.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{service.description}</p>
                <p className="text-sm text-blue-600">{service.price}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Testimonial */}
      <div className="px-6 mb-6">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-none">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm text-gray-700 mb-2">
            "Fast, reliable, and my clothes always come back looking brand new!"
          </p>
          <p className="text-xs text-gray-500">- Sarah M.</p>
        </Card>
      </div>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function User({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ShoppingBag({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
