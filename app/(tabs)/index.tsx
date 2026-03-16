import React from 'react';

import { HomeCategories } from '@/components/home-categories';
import { HomeHeader } from '@/components/home-header';
import { ProductList } from '@/components/product-list';
import SafeScrollView from '@/components/scroll-view';

export default function HomeScreen() {
  return (
    <SafeScrollView>
      <HomeHeader />
      <HomeCategories />
      <ProductList />
    </SafeScrollView>
  );
}

