import { Leaf, Smartphone, Truck } from "lucide-react";

const HeroSection = () => {
      const slides = [
            {
                  id: 1,
                  icon: <Leaf className="w-20 h-20 sm:w-28 sm:h-28 text-green-400 drop-shadow-lg"/>,
                  title: "Fresh Organic Groceries 🌳",
                  subtitle: "Farm-fresh fruits, vegetables, and daily essentials delivered to you.",
                  btnText: "Shop Now",
                  bg: "https://images.unsplash.com/photo-1570913196376-dacb677ef459?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            },
            {
                  id: 2,
                  icon: <Truck className="w-20 h-20 sm:w-28 sm:h-28 text-green-400 drop-shadow-lg"/>,
                  title: "Fast & Reliable Delivery 🚇",
                  subtitle: "We ensure your groceries reach your doorstep in on time.",
                  btnText: "Order Now",
                  bg: "https://images.unsplash.com/photo-1648394794449-5dbe63f6a8b5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            },
            {
                  id: 3,
                  icon: <Smartphone className="w-20 h-20 sm:w-28 sm:h-28 text-green-400 drop-shadow-lg"/>,
                  title: "Shop anytime, Anywhere 📱",
                  subtitle: "Easy and seamless online grocery shopping experience",
                  btnText: "Get Started",
                  bg: "https://images.unsplash.com/photo-1547406858-5faf93435e80?q=80&w=1466&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            },
      ]
      return (
            <div>
                  
            </div>
      );
};

export default HeroSection;