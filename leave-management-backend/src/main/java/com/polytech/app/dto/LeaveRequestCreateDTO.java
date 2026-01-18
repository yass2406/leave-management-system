package com.polytech.app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.FutureOrPresent;
import java.time.LocalDate;

public class LeaveRequestCreateDTO {
    @NotNull
    public String leaveTypeId;
    
    @NotNull
    @FutureOrPresent
    public LocalDate startDate;
    
    @NotNull
    @FutureOrPresent
    public LocalDate endDate;
    
    public String reason;
}
