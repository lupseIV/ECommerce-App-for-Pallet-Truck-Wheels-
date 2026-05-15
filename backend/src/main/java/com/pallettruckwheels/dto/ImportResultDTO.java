package com.pallettruckwheels.dto;

import lombok.Data;

import java.util.List;

@Data
public class ImportResultDTO {
    private int successCount;
    private int errorCount;
    private List<String> errors;
}
