package com.mateoosz.portfolio.backend.repository;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.model.ProductCategory;
import com.mateoosz.portfolio.backend.model.ProductType;

@DataJpaTest
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Test
    void shouldReturnProductsOrderedByCreatedOnDescending() {
        Instant now = Instant.now();
        Product olderProduct = product(
                "Older Skates",
                "SKATE-OLD-001",
                now.minusSeconds(60)
        );
        Product newerProduct = product(
                "Newer Skates",
                "SKATE-NEW-001",
                now
        );
        productRepository.save(olderProduct);
        productRepository.save(newerProduct);

        List<Product> products = productRepository.findAllByOrderByCreatedOnDesc();

        assertEquals("Newer Skates", products.get(0).getName());
        assertEquals(now, products.get(0).getCreatedOn());
        assertEquals("Older Skates", products.get(1).getName());
        assertEquals(now.minusSeconds(60), products.get(1).getCreatedOn());
    }

    private Product product(String name,
                            String sku,
                            Instant createdOn) {
        Product product = new Product();
        product.setName(name);
        product.setSku(sku);
        product.setPrice(100.0);
        product.setStock(10);
        product.setCategory(ProductCategory.SKATES);
        product.setType(ProductType.FREESKATE);
        product.setCreatedOn(createdOn);
        return product;
    }
}
