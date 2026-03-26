package com.example.demo.config;

import com.example.demo.model.MenuItem;
import com.example.demo.repository.MenuItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class DataLoader {

    @Bean
    public CommandLineRunner loadData(MenuItemRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                MenuItem m1 = new MenuItem(); m1.setName("雞胸肉餐盒"); m1.setPrice(180); m1.setCategory("高蛋白"); m1.setImage("image/chicken.webp");
                MenuItem m2 = new MenuItem(); m2.setName("牛排餐盒"); m2.setPrice(250); m2.setCategory("高蛋白"); m2.setImage("image/beef.webp");
                MenuItem m3 = new MenuItem(); m3.setName("藜麥沙拉"); m3.setPrice(150); m3.setCategory("低糖"); m3.setImage("image/quinoa_salad.webp");
                MenuItem m4 = new MenuItem(); m4.setName("糙米壽司"); m4.setPrice(120); m4.setCategory("低糖"); m4.setImage("image/brown_rice_sushi.webp");
                MenuItem m5 = new MenuItem(); m5.setName("綠色蔬菜拼盤"); m5.setPrice(130); m5.setCategory("均衡飲食"); m5.setImage("image/green_vegetables.webp");
                MenuItem m6 = new MenuItem(); m6.setName("鮭魚餐盒"); m6.setPrice(220); m6.setCategory("均衡飲食"); m6.setImage("image/salmon_meal.webp");
                
                repository.saveAll(Arrays.asList(m1, m2, m3, m4, m5, m6));
            }
        };
    }
}
