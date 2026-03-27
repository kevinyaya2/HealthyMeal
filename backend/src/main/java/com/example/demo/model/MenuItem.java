package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Integer price;
    private String category;
    private String image;
    @Column(nullable = false)
    private Boolean active;

    @PrePersist
    public void onCreate() {
        if (active == null) {
            active = true;
        }
    }
}
