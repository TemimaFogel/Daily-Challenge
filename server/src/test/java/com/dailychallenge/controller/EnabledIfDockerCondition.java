package com.dailychallenge.controller;

import org.junit.jupiter.api.extension.ConditionEvaluationResult;
import org.junit.jupiter.api.extension.ExecutionCondition;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.testcontainers.DockerClientFactory;

/**
 * JUnit 5 execution condition: disables the test when Docker is not available,
 * so Testcontainers-based tests are skipped instead of failing.
 */
public class EnabledIfDockerCondition implements ExecutionCondition {

    @Override
    public ConditionEvaluationResult evaluateExecutionCondition(ExtensionContext context) {
        try {
            if (DockerClientFactory.instance().isDockerAvailable()) {
                return ConditionEvaluationResult.enabled("Docker is available");
            }
        } catch (Exception ignored) {
            // Docker check failed
        }
        return ConditionEvaluationResult.disabled("Docker is required for this test");
    }
}
