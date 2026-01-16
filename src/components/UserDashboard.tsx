import connectDb from '@/lib/db';
import CategorySlider from './CategorySlider';
import HeroSection from './HeroSection';
import Grocery, { IGrocery } from '@/models/grocery.model';
import GroceryItemCard from './GroceryItemCard';

const UserDashboard = async () => {
      await connectDb();
      const groceries = await Grocery.find({}).lean();
      const plainGroceries = JSON.parse(JSON.stringify(groceries));

      return (
            <>
                  <HeroSection />
                  <CategorySlider />
                  <div className='w-[90% md:w-[80%] mx-auto mt-10]'>
                        <h2 className='text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center'>Grocery Items</h2>
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6'>
                              {plainGroceries?.map((item: IGrocery) => (
                                    <GroceryItemCard key={String(item?._id)} item={item} />
                              ))}
                        </div>
                  </div>
            </>
      );
};

export default UserDashboard;