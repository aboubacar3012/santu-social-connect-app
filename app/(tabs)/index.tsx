import React from 'react';

import { HomeCategories } from '@/components/home-categories';
import { ProductList } from '@/components/product-list';
import SafeScrollView from '@/components/scroll-view';

export default function HomeScreen() {
  return (
    <SafeScrollView>
        <HomeCategories />
        <ProductList />
    </SafeScrollView>
  );
}

